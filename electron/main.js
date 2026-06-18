const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    frame: false,
    backgroundColor: '#1a1a1a',
    show: true, // Показываем СРАЗУ
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      sandbox: false
    }
  });

  if (isDev) {
    console.log('[KaifBrowser] Development mode');
    // Dev: пробуем загрузить с dev server
    mainWindow.loadURL('http://localhost:5173').catch(err => {
      console.error('[KaifBrowser] Dev server failed:', err);
      // Fallback: загружаем из dist
      const distPath = path.join(__dirname, '..', 'dist', 'index.html');
      if (fs.existsSync(distPath)) {
        console.log('[KaifBrowser] Loading from dist:', distPath);
        mainWindow.loadFile(distPath);
      } else {
        console.error('[KaifBrowser] dist/index.html not found');
        mainWindow.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
          <html>
            <body style="background:#1a1a1a;color:#ff0040;font-family:monospace;padding:40px">
              <h1>⚠️ Dev server not running!</h1>
              <p>Run: <code>npm run dev</code></p>
              <p>Or build: <code>npm run build</code></p>
              <p>Path checked: ${distPath}</p>
            </body>
          </html>
        `));
      }
    });
    mainWindow.webContents.openDevTools();
  } else {
    console.log('[KaifBrowser] Production mode');
    console.log('[KaifBrowser] __dirname:', __dirname);
    console.log('[KaifBrowser] app.getAppPath():', app.getAppPath());
    console.log('[KaifBrowser] isPackaged:', app.isPackaged);
    
    // Production: ищем index.html
    const possiblePaths = [
      path.join(__dirname, '..', 'dist', 'index.html'),
      path.join(app.getAppPath(), 'dist', 'index.html'),
      path.join(process.resourcesPath || '', 'dist', 'index.html'),
      path.join(__dirname, 'dist', 'index.html')
    ];
    
    console.log('[KaifBrowser] Checking paths:');
    let loaded = false;
    
    for (const p of possiblePaths) {
      console.log('  -', p, fs.existsSync(p) ? '✅' : '❌');
      if (fs.existsSync(p)) {
        console.log('[KaifBrowser] ✅ Loading from:', p);
        mainWindow.loadFile(p);
        loaded = true;
        break;
      }
    }
    
    if (!loaded) {
      console.error('[KaifBrowser] ❌ index.html NOT FOUND in any path!');
      // Показываем ошибку В ОКНЕ
      const errorHtml = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                color: #ff0040;
                font-family: 'Segoe UI', monospace;
                padding: 40px;
                margin: 0;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background: rgba(0,0,0,0.3);
                padding: 30px;
                border-radius: 10px;
                border: 2px solid #ff0040;
              }
              h1 {
                font-size: 32px;
                margin: 0 0 20px 0;
                text-shadow: 0 0 10px rgba(255,0,64,0.5);
              }
              .path {
                background: rgba(255,255,255,0.1);
                padding: 10px;
                margin: 10px 0;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                word-break: break-all;
              }
              .error {
                color: #ff6666;
                font-weight: bold;
              }
              .info {
                color: #ffffff;
                margin: 20px 0;
                line-height: 1.6;
              }
              code {
                background: rgba(255,0,64,0.2);
                padding: 2px 6px;
                border-radius: 3px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ index.html not found!</h1>
              <div class="info">
                <p class="error">The application cannot find the frontend files.</p>
                <p>This usually means the build failed or files are missing.</p>
              </div>
              <h3>Checked paths:</h3>
              ${possiblePaths.map(p => `
                <div class="path">
                  ${p}<br>
                  <span style="color:${fs.existsSync(p) ? '#00ff00' : '#ff0000'}">
                    ${fs.existsSync(p) ? '✅ EXISTS' : '❌ NOT FOUND'}
                  </span>
                </div>
              `).join('')}
              <div class="info">
                <p><strong>Debug info:</strong></p>
                <div class="path">
                  __dirname: ${__dirname}<br>
                  app.getAppPath(): ${app.getAppPath()}<br>
                  resourcesPath: ${process.resourcesPath || 'N/A'}<br>
                  isPackaged: ${app.isPackaged}
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      mainWindow.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(errorHtml));
    }
  }

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