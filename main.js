const { app, BrowserWindow, ipcMain, Menu, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let activeDownloads = {};

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

  // --- Обработка скачивания ---
  session.defaultSession.on('will-download', (event, item, webContents) => {
    const filename = item.getFilename();
    const savePath = dialog.showSaveDialogSync(mainWindow, {
      defaultPath: path.join(app.getPath('downloads'), filename),
      title: 'Сохранить файл'
    });

    if (savePath) {
      item.setSavePath(savePath);
      const id = Date.now().toString();
      activeDownloads[id] = { filename, progress: 0, total: item.getTotalBytes() };
      item.on('updated', (event, state) => {
        if (state === 'progressing') {
          const progress = item.getReceivedBytes() / item.getTotalBytes();
          activeDownloads[id].progress = progress;
          mainWindow.webContents.send('download-progress', { id, progress, filename });
        }
      });
      item.once('done', (event, state) => {
        delete activeDownloads[id];
        mainWindow.webContents.send('download-done', { id, filename, state });
      });
    } else {
      event.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  // Обход блокировок (раскомментируй если нужен прокси)
  // session.defaultSession.setProxy({ proxyRules: 'http://proxy:8080' });
  
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

// Контекстное меню
ipcMain.on('context-menu', (event, link) => {
  const menu = Menu.buildFromTemplate([
    { label: 'Открыть в новой вкладке', enabled: !!link, click: () => event.sender.send('open-new-tab', link) },
    { type: 'separator' },
    { label: 'Обновить', click: () => event.sender.send('refresh-page') }
  ]);
  menu.popup();
});

// --- Менеджер паролей ---
const passwordsFile = path.join(app.getPath('userData'), 'passwords.json');

function readPasswords() {
  try {
    if (fs.existsSync(passwordsFile)) {
      return JSON.parse(fs.readFileSync(passwordsFile, 'utf8'));
    }
    return {};
  } catch {
    return {};
  }
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

ipcMain.handle('delete-password', (event, { domain, username }) => {
  const data = readPasswords();
  if (data[domain] && data[domain][username]) {
    delete data[domain][username];
    if (Object.keys(data[domain]).length === 0) delete data[domain];
    writePasswords(data);
  }
  return true;
});

// Обработка сообщений из webview (для захвата паролей)
app.on('web-contents-created', (event, contents) => {
  contents.on('ipc-message', (event, channel, ...args) => {
    if (channel === 'save-password-from-webview') {
      const { domain, username, password } = args[0];
      const data = readPasswords();
      if (!data[domain]) data[domain] = {};
      data[domain][username] = password;
      writePasswords(data);
      console.log('Пароль сохранён для:', domain);
    }
  });
});