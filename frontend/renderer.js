//const { ipcRenderer } = require('electron');
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
  const sidebar = document.getElementById('sidebar');

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
});