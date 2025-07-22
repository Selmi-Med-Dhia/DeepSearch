const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { spawn } = require('child_process')
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 920,
    minHeight: 650,
    icon : path.join(__dirname, 'assets/logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true
  });

  win.loadFile('index.html');
  console.log("Electron is running!");
  //win.webContents.openDevTools();
}

///////////server/////////
const server = spawn('python', ["-m", "backend.server"], {
  cwd: path.resolve(__dirname, '..')
});

server.stdout.on('data', data=>{
  const message = data.toString().trim();
  console.log(`Server stdout: ${message}`);
});
server.stderr.on('data', data=>{
  console.log("stderr " + data);
});
server.on('close', code=>{
  console.log("the server exited with code "+String(code));
});

app.on('quit', () => {
  server.kill();
});
/////////////////////////

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

app.whenReady().then(createWindow);