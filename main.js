const { app, BrowserWindow, ipcMain, Menu, dialog, session, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let downloadHandlersRegistered = false;

async function handleDownload(event, item, webContents) {
  try {
    const filename = item.getFilename();
    const defaultPath = path.join(app.getPath('downloads'), filename);

    // Show save dialog asynchronously so we don't block the main loop
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultPath,
      title: 'Сохранить файл'
    });

    if (result.canceled || !result.filePath) {
      // If user cancelled, prevent the download
      event.preventDefault();
      return;
    }

    const savePath = result.filePath;
    item.setSavePath(savePath);

    const downloadInfo = { id: item.id, filename, path: savePath, progress: 0, state: 'progressing' };
    if (mainWindow && mainWindow.webContents) mainWindow.webContents.send('download-started', downloadInfo);

    item.on('updated', (evt, state) => {
      if (state === 'progressing') {
        const total = item.getTotalBytes();
        const received = item.getReceivedBytes();
        const progress = total ? (received / total) : 0;
        if (mainWindow && mainWindow.webContents) mainWindow.webContents.send('download-progress', { id: item.id, filename, progress, path: savePath });
      }
    });

    item.once('done', (evt, state) => {
      if (mainWindow && mainWindow.webContents) mainWindow.webContents.send('download-done', { filename, state, path: savePath });
    });
  } catch (err) {
    // If something fails, try to cancel gracefully
    try { event.preventDefault(); } catch (e) {}
    console.warn('handleDownload error:', err);
  }
}

function registerDownloadHandlers() {
  if (downloadHandlersRegistered) return;
  downloadHandlersRegistered = true;

  // Default session
  if (session && session.defaultSession && session.defaultSession.listenerCount('will-download') === 0) {
    session.defaultSession.on('will-download', (event, item, webContents) => {
      handleDownload(event, item, webContents);
    });
  }

  // Persisted webview partition
  try {
    const webviewSession = session.fromPartition('persist:kaifbrowser');
    if (webviewSession && webviewSession.listenerCount('will-download') === 0) {
      webviewSession.on('will-download', (event, item, webContents) => {
        handleDownload(event, item, webContents);
      });
    }
  } catch (e) {
    // ignore if partition cannot be found yet
  }
}

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

  // Ensure download handlers are registered once
  registerDownloadHandlers();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Async password file access using promises to avoid blocking the main thread
const passwordsFile = path.join(app.getPath('userData'), 'passwords.json');
async function readPasswords() {
  try {
    const contents = await fs.promises.readFile(passwordsFile, 'utf8');
    return JSON.parse(contents || '{}');
  } catch (e) {
    return {};
  }
}
async function writePasswords(data) {
  await fs.promises.mkdir(path.dirname(passwordsFile), { recursive: true }).catch(()=>{});
  await fs.promises.writeFile(passwordsFile, JSON.stringify(data, null, 2), 'utf8');
}

ipcMain.handle('get-passwords', async () => {
  return await readPasswords();
});
ipcMain.handle('save-password', async (event, { domain, username, password }) => {
  const data = await readPasswords();
  if (!data[domain]) data[domain] = {};
  data[domain][username] = password;
  await writePasswords(data);
  return true;
});
ipcMain.handle('get-passwords-for-domain', async (event, domain) => {
  const data = await readPasswords();
  return data[domain] || {};
});

ipcMain.handle('open-download-folder', async (event, folderPath) => {
  return await shell.openPath(folderPath);
});

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
