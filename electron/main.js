const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    backgroundColor: '#0f0f0f',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // ПРОСТО загружаем index.html
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  console.log('Loading:', indexPath);
  
  mainWindow.loadFile(indexPath).catch(err => {
    console.error('Failed to load:', err);
    mainWindow.loadURL('data:text/html,<h1>Error loading app</h1>');
  });

  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());