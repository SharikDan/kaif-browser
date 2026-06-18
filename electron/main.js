const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

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
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      sandbox: false
    }
  });

  const isDev = !app.isPackaged;
  console.log('[KaifBrowser] isDev:', isDev);
  
  if (isDev) {
    // Development: загружаем с Vite dev server
    mainWindow.loadURL('http://localhost:5173').catch(err => {
      console.error('[KaifBrowser] Dev server not available:', err);
      // Fallback: пробуем загрузить из dist
      const distPath = path.join(__dirname, '..', 'dist', 'index.html');
      console.log('[KaifBrowser] Trying fallback to:', distPath);
      if (fs.existsSync(distPath)) {
        mainWindow.loadFile(distPath);
      } else {
        mainWindow.webContents.loadURL('data:text/html,<html><body style="background:#0f0f0f;color:red;font-family:monospace;padding:40px"><h1>Dev server not running!</h1><p>Run: npm run dev</p></body></html>');
      }
    });
    mainWindow.webContents.openDevTools();
  } else {
    // Production: ищем dist/index.html
    // В Electron Builder файлы упаковываются в asar архив
    const basePath = process.resourcesPath || __dirname;
    const indexPath = path.join(basePath, 'app.asar', 'dist', 'index.html');
    
    console.log('[KaifBrowser] Production mode');
    console.log('[KaifBrowser] basePath:', basePath);
    console.log('[KaifBrowser] indexPath:', indexPath);
    console.log('[KaifBrowser] __dirname:', __dirname);
    console.log('[KaifBrowser] process.resourcesPath:', process.resourcesPath);
    
    // Проверяем существует ли файл
    if (fs.existsSync(indexPath)) {
      console.log('[KaifBrowser] ✅ Found index.html');
      mainWindow.loadFile(indexPath);
    } else {
      // Пробуем альтернативные пути
      const alternatives = [
        path.join(__dirname, 'dist', 'index.html'),
        path.join(__dirname, '..', 'dist', 'index.html'),
        path.join(app.getAppPath(), 'dist', 'index.html')
      ];
      
      let loaded = false;
      for (const altPath of alternatives) {
        console.log('[KaifBrowser] Trying:', altPath);
        if (fs.existsSync(altPath)) {
          console.log('[KaifBrowser] ✅ Found at:', altPath);
          mainWindow.loadFile(altPath);
          loaded = true;
          break;
        }
      }
      
      if (!loaded) {
        console.error('[KaifBrowser] ❌ index.html NOT FOUND!');
        // Показываем ошибку
        mainWindow.webContents.loadURL('data:text/html,' + encodeURIComponent(`
          <html>
            <body style="background:#0f0f0f;color:red;font-family:monospace;padding:40px">
              <h1>index.html not found!</h1>
              <p>Checked paths:</p>
              <ul>
                <li>${indexPath}</li>
                ${alternatives.map(p => '<li>' + p + '</li>').join('')}
              </ul>
              <p>basePath: ${basePath}</p>
              <p>__dirname: ${__dirname}</p>
              <p>resourcesPath: ${process.resourcesPath}</p>
            </body>
          </html>
        `));
      }
    }
  }

  mainWindow.once('ready-to-show', () => {
    console.log('[KaifBrowser] Window ready');
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