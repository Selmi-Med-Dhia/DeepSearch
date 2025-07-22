const { ipcRenderer } = require('electron');

try {
    const $ = require('jquery');
    window.$ = window.jQuery = $;
    require('select2')(window.$);
} catch (e) {
}

$(function () {
    $('#objectSelector').select2({});
});


//list of presets
//index of selected preset
//generated folder
//settings
//history

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
  veil = document.querySelector(".veil");
  for(i=0;i<10;i++){
    veil.style.opacity = String((9.0-i)/10);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  veil.remove()
})();


coherent_checkboxes()
coherent_custom_folder_area()
document.getElementById("generate-folder-checkbox").addEventListener("change", e => coherent_checkboxes(e))
document.getElementById("customize-folder-checkbox").addEventListener("change", e => coherent_custom_folder_area(e))
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

/*
fetch('http://127.0.0.1:5000/', {
  method: 'GET',
})
.then(response => response.json())
.then(data => {
  console.log(data.message);
})
.catch(error => {
  console.log('Error: '+error);
})
*/