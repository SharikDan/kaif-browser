const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  console.log('[KaifBrowser] Creating window...');
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    frame: false,
    backgroundColor: '#0f0f0f',
    show: false, // Не показываем сразу
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      sandbox: false
    }
  });

  // Определяем режим
  const isDev = !app.isPackaged;
  console.log('[KaifBrowser] isDev:', isDev);
  console.log('[KaifBrowser] __dirname:', __dirname);
  console.log('[KaifBrowser] app.getAppPath():', app.getAppPath());

  if (isDev) {
    const devUrl = 'http://localhost:5173';
    console.log('[KaifBrowser] Loading dev URL:', devUrl);
    mainWindow.loadURL(devUrl).catch(err => {
      console.error('[KaifBrowser] Failed to load dev URL:', err);
      // Fallback: пробуем загрузить dist
      const fallbackPath = path.join(__dirname, '..', 'dist', 'index.html');
      console.log('[KaifBrowser] Trying fallback:', fallbackPath);
      mainWindow.loadFile(fallbackPath).catch(err2 => {
        console.error('[KaifBrowser] Fallback also failed:', err2);
      });
    });
    mainWindow.webContents.openDevTools();
  } else {
    // Production: ищем index.html
    const possiblePaths = [
      path.join(__dirname, '..', 'dist', 'index.html'),
      path.join(app.getAppPath(), 'dist', 'index.html'),
      path.join(__dirname, 'dist', 'index.html'),
      path.join(process.resourcesPath || '', 'app', 'dist', 'index.html')
    ];
    
    console.log('[KaifBrowser] Possible paths:');
    possiblePaths.forEach(p => console.log('  -', p));
    
    const fs = require('fs');
    let loaded = false;
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        console.log('[KaifBrowser] ✅ Found:', p);
        mainWindow.loadFile(p).catch(err => {
          console.error('[KaifBrowser] Failed to load:', p, err);
        });
        loaded = true;
        break;
      } else {
        console.log('[KaifBrowser] ❌ Not found:', p);
      }
    }
    
    if (!loaded) {
      console.error('[KaifBrowser] ❌ index.html NOT FOUND in any path!');
      // Показываем ошибку в окне
      mainWindow.loadURL('data:text/html,<html><body style="background:#0f0f0f;color:red;font-family:monospace;padding:40px"><h1>index.html not found!</h1><p>Checked paths:</p><ul>' + 
        possiblePaths.map(p => '<li>' + p + '</li>').join('') + 
        '</ul></body></html>');
    }
  }

  // Показываем окно когда готово
  mainWindow.once('ready-to-show', () => {
    console.log('[KaifBrowser] Window ready to show');
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[KaifBrowser] Load failed:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log('[Renderer]', message);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log('[KaifBrowser] App ready');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});