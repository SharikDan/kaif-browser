const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
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
  
  if (isDev) {
    // Dev: Vite dev server
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      const fallback = path.join(__dirname, '..', 'dist', 'index.html');
      if (fs.existsSync(fallback)) {
        mainWindow.loadFile(fallback);
      } else {
        mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(
          '<html><body style="background:#0f0f0f;color:#ff0040;font-family:monospace;padding:40px">' +
          '<h1>Dev server not running!</h1><p>Run: npm run dev</p></body></html>'
        ));
      }
    });
    mainWindow.webContents.openDevTools();
  } else {
    // Production: dist/index.html рядом с main.js
    // В asar: app.asar/electron/main.js -> app.asar/dist/index.html
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    
    console.log('[KaifBrowser] Production mode');
    console.log('[KaifBrowser] __dirname:', __dirname);
    console.log('[KaifBrowser] indexPath:', indexPath);
    console.log('[KaifBrowser] exists:', fs.existsSync(indexPath));
    
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      // Показываем ошибку с путями
      const errorHtml = '<html><body style="background:#0f0f0f;color:#ff0040;font-family:monospace;padding:40px">' +
        '<h1>index.html not found!</h1>' +
        '<p>Path: ' + indexPath + '</p>' +
        '<p>__dirname: ' + __dirname + '</p>' +
        '<p>isPackaged: ' + app.isPackaged + '</p>' +
        '</body></html>';
      mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(errorHtml));
    }
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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