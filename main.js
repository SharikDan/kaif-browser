const { app, BrowserWindow, ipcMain, Menu, dialog, session, shell } = require('electron');
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
        if (state === 'completed') {
          // Сохраняем в историю загрузок
          addDownloadHistory(filename, savePath, item.getTotalBytes());
          shell.showItemInFolder(savePath);
        }
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

// ===== Менеджер паролей =====
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

// ===== История загрузок =====
const downloadsFile = path.join(app.getPath('userData'), 'downloads.json');
let downloadsHistory = [];

function loadDownloadsHistory() {
  try {
    const data = fs.readFileSync(downloadsFile, 'utf8');
    downloadsHistory = JSON.parse(data);
  } catch { downloadsHistory = []; }
}

function saveDownloadsHistory() {
  fs.writeFileSync(downloadsFile, JSON.stringify(downloadsHistory, null, 2));
}

function addDownloadHistory(filename, path, size) {
  downloadsHistory.unshift({
    filename,
    path,
    size,
    date: new Date().toISOString()
  });
  if (downloadsHistory.length > 100) downloadsHistory.pop();
  saveDownloadsHistory();
  mainWindow.webContents.send('download-history-updated', downloadsHistory);
}

loadDownloadsHistory();

ipcMain.handle('get-downloads-history', () => downloadsHistory);
ipcMain.handle('open-download-folder', (event, filePath) => {
  if (filePath) {
    shell.showItemInFolder(filePath);
  } else {
    shell.openPath(app.getPath('downloads'));
  }
});

// ===== История поиска =====
const searchHistoryFile = path.join(app.getPath('userData'), 'searchHistory.json');
let searchHistory = [];

function loadSearchHistory() {
  try {
    const data = fs.readFileSync(searchHistoryFile, 'utf8');
    searchHistory = JSON.parse(data);
  } catch { searchHistory = []; }
}

function saveSearchHistory() {
  fs.writeFileSync(searchHistoryFile, JSON.stringify(searchHistory, null, 2));
}

loadSearchHistory();

ipcMain.handle('get-search-history', () => searchHistory);
ipcMain.handle('add-search-history', (event, query) => {
  if (!query) return;
  searchHistory = searchHistory.filter(item => item !== query);
  searchHistory.unshift(query);
  if (searchHistory.length > 100) searchHistory.pop();
  saveSearchHistory();
  mainWindow.webContents.send('search-history-updated', searchHistory);
});
ipcMain.handle('clear-search-history', () => {
  searchHistory = [];
  saveSearchHistory();
  mainWindow.webContents.send('search-history-updated', searchHistory);
});

// ===== PiP (Picture-in-Picture) =====
ipcMain.handle('open-pip', (event, url) => {
  if (!url) return;
  const pipWindow = new BrowserWindow({
    width: 400,
    height: 300,
    alwaysOnTop: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  pipWindow.loadURL(url);
});