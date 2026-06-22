const { app, BrowserWindow, ipcMain, Menu, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');

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

  // Универсальный перехват скачиваний
  function handleDownload(event, item, webContents) {
    const filename = item.getFilename();
    const savePath = dialog.showSaveDialogSync(mainWindow, {
      defaultPath: path.join(app.getPath('downloads'), filename),
      title: 'Сохранить файл'
    });

    if (savePath) {
      item.setSavePath(savePath);
      item.on('updated', (event, state) => {
        if (state === 'progressing') {
          const progress = item.getReceivedBytes() / item.getTotalBytes();
          mainWindow.webContents.send('download-progress', { id: item.id, filename, progress });
        }
      });
      item.once('done', (event, state) => {
        mainWindow.webContents.send('download-done', { filename, state });
      });
    } else {
      event.preventDefault();
    }
  }

  session.defaultSession.on('will-download', handleDownload);
  const webviewSession = session.fromPartition('persist:kaifbrowser');
  webviewSession.on('will-download', handleDownload);
  mainWindow.webContents.session.on('will-download', handleDownload);
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

ipcMain.on('window-minimize', () => { if (mainWindow) mainWindow.minimize(); });
ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});
ipcMain.on('window-close', () => { if (mainWindow) mainWindow.close(); });

ipcMain.on('context-menu', (event, link) => {
  const menu = Menu.buildFromTemplate([
    { label: 'Открыть в новой вкладке', enabled: !!link, click: () => event.sender.send('open-new-tab', link) },
    { type: 'separator' },
    { label: 'Обновить', click: () => event.sender.send('refresh-page') }
  ]);
  menu.popup();
});

const passwordsFile = path.join(app.getPath('userData'), 'passwords.json');
function readPasswords() {
  try { return JSON.parse(fs.readFileSync(passwordsFile, 'utf8')); }
  catch { return {}; }
}
function writePasswords(data) {
  fs.writeFileSync(passwordsFile, JSON.stringify(data, null, 2));
}
ipcMain.handle('get-passwords', () => readPasswords());
ipcMain.handle('save-password', (event, { domain, username, password }) => {
  const data = readPasswords();
  if (!data[domain]) data[domain] = {};
  data[domain][username] = password;
  writePasswords(data);
  return true;
});
ipcMain.handle('get-passwords-for-domain', (event, domain) => {
  const data = readPasswords();
  return data[domain] || {};
});