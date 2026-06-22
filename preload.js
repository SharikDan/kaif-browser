const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Управление окном
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // Контекстное меню
  showContextMenu: (link) => ipcRenderer.send('context-menu', link),
  onOpenNewTab: (callback) => ipcRenderer.on('open-new-tab', (event, link) => callback(link)),
  onRefresh: (callback) => ipcRenderer.on('refresh-page', () => callback()),
  
  // Новые окна из main
  onOpenUrl: (callback) => ipcRenderer.on('open-url', (event, url) => callback(url)),
  onNewTab: (callback) => ipcRenderer.on('new-tab', (event, url) => callback(url)),
  
  // Скачивание
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, data) => callback(data)),
  onDownloadDone: (callback) => ipcRenderer.on('download-done', (event, data) => callback(data)),
  
  // Пароли
  getPasswords: () => ipcRenderer.invoke('get-passwords'),
  savePassword: (domain, username, password) => ipcRenderer.invoke('save-password', { domain, username, password }),
  getPasswordsForDomain: (domain) => ipcRenderer.invoke('get-passwords-for-domain', domain)
});