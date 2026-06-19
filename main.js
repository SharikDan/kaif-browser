const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    backgroundColor: '#0f0f0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('crashed', () => {
    console.error('Рендерер упал, перезагружаем...');
    mainWindow.reload();
  });

  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Управление окном
ipcMain.on('window-minimize', () => { if (mainWindow) mainWindow.minimize(); });
ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});
ipcMain.on('window-close', () => { if (mainWindow) mainWindow.close(); });

// --- Контекстное меню ---
ipcMain.on('context-menu', (event, link) => {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Открыть в новой вкладке',
      enabled: !!link,
      click: () => {
        event.sender.send('open-new-tab', link);
      }
    },
    { type: 'separator' },
    {
      label: 'Обновить',
      click: () => {
        event.sender.send('refresh-page');
      }
    }
  ]);
  menu.popup();
});