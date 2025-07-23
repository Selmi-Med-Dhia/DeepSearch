const { ipcRenderer } = require('electron');
const { format } = require('date-fns');

try {
    const $ = require('jquery');
    window.$ = window.jQuery = $;
    require('select2')(window.$);
} catch (e) {
}

$(function () {
    $('#objectSelector').select2({});
});

let presets = [];
let selected_preset = 0;
let presets_html = [];
let generated_folder = "";
let custom_result_folder = "";
let settings = [];
let history = [];
let class_names = [];

async function selectFolder(source) {
  const path = await ipcRenderer.invoke('select-folder');
  if (path) {
    if (source == 1){//add folder
      let preset = presets[selected_preset];
      if (!preset.directories.includes(path)){
        preset.directories.push(path);
        document.getElementById("directories-area").value = preset.directories.join('\n');
        update_preset(preset);
      }
    }else if (source == 2){//customize folder
      add_custom_result_folder(path);
      document.getElementById("custom-folder-area").value = path;
    }else{//customize parent folder
      if (settings.default_parent_dict != path){
        settings.default_parent_dict = path;
        document.getElementById("custom-folder-area-settings").value = path;
        update_settings(settings);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const gearBtn = document.getElementById('gear-button');
  const homeBtn = document.getElementById('settings-home-button');
  const sidebar = document.getElementById('sidebar1');

  let isAnimating = false;
  openclose = () => {
    if (isAnimating) return;

    isAnimating = true;
    sidebar.classList.toggle('active');

    setTimeout(() => {
      isAnimating = false;
    }, 500);
  };
  gearBtn.addEventListener('click', openclose)
  homeBtn.addEventListener('click', openclose)
  slider.addEventListener('input', updateSliderBackground);
  updateSliderBackground();
});

document.addEventListener('DOMContentLoaded', () => {
  const clockBtn = document.getElementById('clock-button');
  const homeBtn = document.getElementById('history-home-button');
  const sidebar = document.getElementById('sidebar2');

  let isAnimating = false;
  openclose = () => {
    if (isAnimating) return;

    isAnimating = true;
    sidebar.classList.toggle('active');

    setTimeout(() => {
      isAnimating = false;
    }, 500);
  };
  clockBtn.addEventListener('click', openclose)
  homeBtn.addEventListener('click', openclose)
});

const slider = document.getElementById('custom-slider');

function updateSliderBackground() {
  const min = +slider.min;
  const max = +slider.max;
  const val = +slider.value;

  const percent = ((val - min) / (max - min)) * 100;

  slider.style.background = `
    linear-gradient(to right,
    #2cff2c 0%,
    #2cff2c ${percent}%,
    #aaa ${percent}%,
    #aaa 100%)`;
}

function coherent_checkboxes(e=null){
  generate_folder_checkbox = document.getElementById("generate-folder-checkbox");
  customize_folder_checkbox = document.getElementById("customize-folder-checkbox");
  add_bbs_checkbox = document.getElementById("add-bbs-checkbox");
  auto_open_checkbox = document.getElementById("auto-open-checkbox");

  state = generate_folder_checkbox.checked

  customize_folder_checkbox.disabled = !state
  add_bbs_checkbox.disabled = !state
  auto_open_checkbox.disabled = !state

  if (!state){
    customize_folder_checkbox.checked = false
    add_bbs_checkbox.checked = false
    auto_open_checkbox.checked = false
    coherent_custom_folder_area();
  }
  presets[selected_preset].options.generate_folder = state;
  presets[selected_preset].options.overlay_bbxs = add_bbs_checkbox.checked;
  presets[selected_preset].options.auto_open = auto_open_checkbox.checked;
  update_preset(presets[selected_preset]);
}

function coherent_custom_folder_area(e=null){
  customize_folder_checkbox = document.getElementById("customize-folder-checkbox");
  custom_folder_area = document.getElementById("custom-folder-area");
  select_folder_button = document.getElementById("select-folder-button");

  state = customize_folder_checkbox.checked

  custom_folder_area.disabled = !state
  select_folder_button.disabled = !state
  if (!state && custom_folder_area.value != ""){
    custom_folder_area.value = "";
    custom_result_folder = "";
    remove_custom_result_folder();
  }
}

async function waitForServer() {
  while (true) {
    try {
      const response = await fetch('http://127.0.0.1:5000/are/you/running');
      if (response.ok) {
        const data = await response.json();
        console.log("Server is up:", data.message);
        break;
      }
    } catch (err) {
      console.log("Server not ready yet...");
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

(async () => {
  await waitForServer();
  // SETUP
  await fetch('http://127.0.0.1:5000/', {
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    presets = data.presets;
    history = data.history;
    settings = data.settings;
    class_names = data.class_names;
    for(i=0; i < presets.length; i++){
      if (presets[i].selected){
        selected_preset = i;
      }
    }
  })
  .catch(error => {
    console.log('Error: '+error);
  })
  ///// loading presets how ever many there are
  presets_menu = document.getElementById("presets-menu");
  for(i=0; i<presets.length; i++){
    pr = document.createElement("div");
    pr.textContent = presets[i].name;
    pr.classList.add("preset");
    if (i == 0){
      pr.classList.add("first");
    }
    if (i == selected_preset){
      pr.classList.add("active");
    }
    presets_menu.appendChild(pr);
    presets_html.push(pr);
  }

  ////// loading class names
  object_selector = document.getElementById("objectSelector");
  for(i=0; i < class_names.length; i++){
    option = document.createElement("option");
    option.value = i;
    option.textContent = class_names[i];
    object_selector.appendChild(option);
  }
  load_preset(presets[selected_preset]);
  load_history(history);
  load_settings(settings);
  update_cache();
  document.getElementById("clear-bad-cache-btn").addEventListener("click", e => clear_bad_cache());
  document.getElementById("clear-all-cache-btn").addEventListener("click", e => clear_all_cache());
  document.getElementById("feedback-btn").addEventListener("click",async e => send_feedback());
  document.getElementById("custom-slider").addEventListener("change", e => {
    settings.thread_count = parseInt(document.getElementById("custom-slider").value);
    update_settings(settings);
  })
  document.getElementById("always-gen-json-checkbox").addEventListener("change", e => {
    settings.always_gen_json = document.getElementById("always-gen-json-checkbox").checked;
    update_settings(settings);
  })
  document.getElementById("add-bbs-checkbox").addEventListener("change", e => {
    if (presets[selected_preset].options.overlay_bbxs != document.getElementById("add-bbs-checkbox").checked){
      presets[selected_preset].options.overlay_bbxs = document.getElementById("add-bbs-checkbox").checked;
      update_preset(presets[selected_preset]);
    }
  })
  document.getElementById("auto-open-checkbox").addEventListener("change", e => {
    if (presets[selected_preset].options.auto_open != document.getElementById("auto-open-checkbox").checked){
      presets[selected_preset].options.auto_open = document.getElementById("auto-open-checkbox").checked;
      update_preset(presets[selected_preset]);
    }
  })
  document.getElementById("sort-checkbox").addEventListener("change", e => {
    if (presets[selected_preset].options.sort != document.getElementById("sort-checkbox").checked){
      presets[selected_preset].options.sort = document.getElementById("sort-checkbox").checked;
      update_preset(presets[selected_preset]);
    }
  })

  document.getElementById("generate-folder-checkbox").addEventListener("change", e => coherent_checkboxes(e));
  document.getElementById("customize-folder-checkbox").addEventListener("change", e => coherent_custom_folder_area(e));
  document.getElementById("min-confidence-input").addEventListener("change", e => {
    input = document.getElementById("min-confidence-input");
    const new_value = parseFloat(input.value)
    if (!isNaN(new_value) && new_value >= 0.1 && new_value <=0.95){
      presets[selected_preset].options.minimum_confidence = new_value;
      update_preset(presets[selected_preset]);
    }
    else{
      input.value = presets[selected_preset].options.minimum_confidence;
    }
  })

  document.getElementById("presets-menu").addEventListener("click", e => {
    if (e.target.classList.contains("preset")){
      preset = e.target;
      for(i=0; i<presets.length; i++){
        if (presets_html[i] == preset && i != selected_preset){
          presets_html[selected_preset].classList.toggle("active");
          presets[selected_preset].selected = false;
          presets[i].selected = true;
          selected_preset = i;
          preset.classList.toggle("active");
          select_preset(presets[selected_preset].name);
          load_preset(presets[selected_preset]);
        }
      }
    }
  })
  document.getElementById("directories-area").addEventListener("mouseup", e => {
    if (e.button == 0 || e.button == 2){
      textarea_div = document.getElementById("directories-area-div");
      textarea = document.getElementById("directories-area");
      const pos = textarea.selectionStart;
      const textBeforeCursor = textarea.value.slice(0, pos);
      const lineNumber = textBeforeCursor.split('\n').length;
      const parentRect = textarea_div.getBoundingClientRect();
      if (e.y - parentRect.top < presets[selected_preset].directories.length * 25 + 10 ){
        badge = document.createElement("div");
        badge.classList.add("badge");
        badge.style.left = (e.x - parentRect.left - 2) + "px";
        badge.style.top = (e.y - parentRect.top - 2) + "px";
        badge.textContent = "Remove folder";
        textarea_div.appendChild(badge);
        badge.addEventListener("mouseout", e => {
          badge.remove();
        })
        badge.addEventListener("click", e => {
          badge.remove();
          presets[selected_preset].directories.splice(lineNumber-1, 1);
          textarea.value = presets[selected_preset].directories.join('\n');
          console.log(lineNumber);
          update_preset(presets[selected_preset]);
        })
      }
    }
  })
  document.getElementById("default-btn").addEventListener("click", e => {
    document.getElementById("generate-folder-checkbox").checked = true;
    document.getElementById("customize-folder-checkbox").checked = false;
    document.getElementById("add-bbs-checkbox").checked = false;
    document.getElementById("auto-open-checkbox").checked = true;
    document.getElementById("sort-checkbox").checked = false;
    document.getElementById("min-confidence-input").value = "0.3";
    presets[selected_preset].options.generate_folder = true;
    presets[selected_preset].options.overlay_bbxs = false;
    presets[selected_preset].options.auto_open = true;
    presets[selected_preset].options.sort = false;
    presets[selected_preset].options.minimum_confidence = 0.3;

    coherent_custom_folder_area();
    update_preset(presets[selected_preset]);
  })

  coherent_checkboxes();
  coherent_custom_folder_area();

  veil = document.querySelector(".veil");
  for(i=0;i<10;i++){
    veil.style.opacity = String((9.0-i)/10);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  veil.remove();
})();

function load_preset(preset){
  document.getElementById("generate-folder-checkbox").checked = preset.options.generate_folder ;
  document.getElementById("add-bbs-checkbox").checked = preset.options.overlay_bbxs ;
  document.getElementById("auto-open-checkbox").checked = preset.options.auto_open ;
  document.getElementById("sort-checkbox").checked = preset.options.sort ;
  document.getElementById("min-confidence-input").value = String(preset.options.minimum_confidence) ;
  
  document.getElementById("directories-area").value = preset.directories.join('\n') ;
  coherent_checkboxes();
  coherent_custom_folder_area();
}
function load_history(hist){
  history_table_body = document.getElementById("history-table-body");
  for(i=0; i < hist.length; i++){
    line = hist[i];
    tr = document.createElement("tr");
    td1 = document.createElement("td");
    date = new Date(line.datetime.year, line.datetime.month, line.datetime.day, line.datetime.hour, line.datetime.minute, line.datetime.second, 0 );
    formatted = format(date, "yyyy-MM-dd") + " at " + format(date, "HH:mm:ss");
    td1.textContent = formatted;
    td2 = document.createElement("td");
    td2.textContent = line.preset_name + ""
    td3 = document.createElement("td");
    filters = "";
    
    if (line.filters.length == class_names.length){
      filters = "all";
    }
    else if (line.filters.length == 1){
      filters = class_names[line.filters[0]];
    }
    else if (line.filters.length == 2){
      filters =  class_names[line.filters[0]] + " and " + class_names[line.filters[1]];
    }
    else if (line.filters.length == 3){
      filters =  class_names[line.filters[0]] + ", "+class_names[line.filters[1]] + " and " + class_names[line.filters[2]];
    }else{
      filters = class_names[line.filters[0]] + ", "+class_names[line.filters[1]] + ", " + class_names[line.filters[2]] + "...";
    }

    td3.textContent = filters;
    td4 = document.createElement("td");
    td4.textContent = line.input_count + "";
    td5 = document.createElement("td");
    td5.textContent = line.result_count + "";
    tr.append(td1, td2, td3, td4, td5);
    history_table_body.appendChild(tr);
  }
}
function load_settings(sett){
  custom_slider = document.getElementById("custom-slider");
  custom_folder_area = document.getElementById("custom-folder-area-settings");
  always_gen_json_checkbox = document.getElementById("always-gen-json-checkbox");

  custom_slider.value = sett.thread_count;
  custom_folder_area.value = sett.default_parent_dict
  always_gen_json_checkbox.checked = sett.always_gen_json
  updateSliderBackground();
}
function update_cache(){
  fetch('http://127.0.0.1:5000/cache/size', {
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    bad_cache = Math.round(data.unuseful * 100) / 100;
    all_cache = Math.round(data.all * 100) / 100;
    function generate_cache_string(size){
      if (size == 0){
        return("0KB");
      }
      if (size>1024){
        return(Math.round((size/1024.0)*100.0)/100 + "MB");
      }
      return(size+"KB");
    }
    bad_cache_string = generate_cache_string(bad_cache);
    all_cache_string = generate_cache_string(all_cache);
    document.getElementById("bad-cache").innerText = bad_cache_string;
    document.getElementById("all-cache").innerText = all_cache_string;
    
    document.getElementById("clear-bad-cache-btn").disabled = (bad_cache == 0);
    document.getElementById("clear-all-cache-btn").disabled = (all_cache == 0);
  })
  .catch(error => {
    console.log('Error: '+error);
  })
}
function clear_bad_cache(){
  fetch('http://127.0.0.1:5000/cache/clearbad', {
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    all_cache = Math.round(data.all * 100) / 100;
    function generate_cache_string(size){
      if (size == 0){
        return("0KB");
      }
      if (size>1024){
        return(Math.round((size/1024.0)*100.0)/100 + "MB");
      }
      return(size+"KB");
    }
    all_cache_string = generate_cache_string(all_cache);
    document.getElementById("bad-cache").innerText = "0KB";
    document.getElementById("all-cache").innerText = all_cache_string;
    
    document.getElementById("clear-bad-cache-btn").disabled = true;
    document.getElementById("clear-all-cache-btn").disabled = (all_cache == 0);
  })
  .catch(error => {
    console.log('Error: '+error);
  })
}
function clear_all_cache(){
  fetch('http://127.0.0.1:5000/cache/clearall', {
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById("bad-cache").innerText = "0KB";
    document.getElementById("all-cache").innerText = "0KB";
    
    document.getElementById("clear-bad-cache-btn").disabled = true;
    document.getElementById("clear-all-cache-btn").disabled = true;
  })
  .catch(error => {
    console.log('Error: '+error);
  })
}
function update_settings(sett){
  fetch('http://127.0.0.1:5000/updatesettings', {
    method: 'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(sett)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch(error => {
    console.log('Error: '+error);
  })
}
function update_preset(preset){
  fetch('http://127.0.0.1:5000/preset/update', {
    method: 'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(preset)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch(error => {
    console.log('Error: '+error);
  })
}
async function send_feedback(){
  let textarea = document.getElementById("feedback-text-area");
  let feedback_btn = document.getElementById("feedback-btn");
  content = textarea.value;
  textarea.value = "Thank you.";
  textarea.disabled = true;
  feedback_btn.disabled = true;
  if (content != ""){
    await fetch('http://127.0.0.1:5000/sendfeedback', {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"content": content})
    })
    .then(response => response.json())
    .then(async data => {
      console.log('Success:', data);
      await new Promise(resolve => setTimeout(resolve, 200))
      .then(async () => {
        textarea.value = "Thank you..";
        await new Promise(resolve => setTimeout(resolve, 400))
        .then(async () => {
          textarea.value = "Thank you...";
          await new Promise(resolve => setTimeout(resolve, 400))
          .then(() => {
            textarea.value = "";
            textarea.disabled = false;
            feedback_btn.disabled = false;
          })
        })
      })

    })
    .catch(error => {
      console.log('Error: '+error);
    })
  }
}
function add_custom_result_folder(path){
  fetch('http://127.0.0.1:5000/customfolder/add', {
    method: 'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"path": path})
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch(error => {
    console.log('Error: '+error);
  })
}
function remove_custom_result_folder(){
  fetch('http://127.0.0.1:5000/customfolder/remove', {
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    console.log("Success"+data);
  })
  .catch(error => {
    console.log('Error: '+error);
  })
}
function select_preset(name){
  fetch('http://127.0.0.1:5000/preset/select', {
    method: 'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"name": name})
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch(error => {
    console.log('Error: '+error);
  })
}