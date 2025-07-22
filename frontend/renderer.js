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
let generated_folder = "";
let settings = [];
let history = [];
let class_names = [];

async function selectFolder() {
  const folderPath = await ipcRenderer.invoke('select-folder');
  if (folderPath) {
    console.log('Selected folder:', folderPath);
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
  }
  //TODO: update local variables
}

function coherent_custom_folder_area(e=null){
  customize_folder_checkbox = document.getElementById("customize-folder-checkbox");
  custom_folder_area = document.getElementById("custom-folder-area");
  select_folder_button = document.getElementById("select-folder-button");

  state = customize_folder_checkbox.checked

  custom_folder_area.disabled = !state
  select_folder_button.disabled = !state
  //TODO: update local variables
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
  
  load_preset(presets[selected_preset]);
  load_history(history);
  load_settings(settings);
  update_cache();
  document.getElementById("clear-bad-cache-btn").addEventListener("click", e => clear_bad_cache());
  document.getElementById("clear-all-cache-btn").addEventListener("click", e => clear_all_cache());
  document.getElementById("custom-slider").addEventListener("change", e => {
    settings.thread_count = parseInt(document.getElementById("custom-slider").value);
    update_settings(settings);
  })
  document.getElementById("always-gen-json-checkbox").addEventListener("change", e => {
    settings.always_gen_json = document.getElementById("always-gen-json-checkbox").checked;
    update_settings(settings);
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

document.getElementById("generate-folder-checkbox").addEventListener("change", e => coherent_checkboxes(e));
document.getElementById("customize-folder-checkbox").addEventListener("change", e => coherent_custom_folder_area(e));
document.getElementById("min-confidence-input").addEventListener("keyup", e => {
  input = document.getElementById("min-confidence-input");
  const new_value = parseFloat(input)
  if (!isNaN(new_value) && new_value >= 0.1 && new_value <=0.95){
    //TODO: update old value
  }
  else{
    //TODO: rollback to previous value
  }
})

document.getElementById("presets-menu").addEventListener("click", e => {
  if (e.target.classList.contains("preset")){
    preset = e.target;
    //TODO: deactivate all other presets
    preset.classList.toggle("active")
  }
})

function load_preset(preset){
  document.getElementById("generate-folder-checkbox").checked = preset.options.generate_folder ;
  document.getElementById("add-bbs-checkbox").checked = preset.options.overlay_bbxs ;
  document.getElementById("auto-open-checkbox").checked = preset.options.auto_open ;
  document.getElementById("sort-checkbox").checked = preset.options.sort ;
  document.getElementById("min-confidence-input").value = String(preset.options.minimum_confidence) ;
  
  document.getElementById("directories-area").value = preset.directories.join('\n') ;
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