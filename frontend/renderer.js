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