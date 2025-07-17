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