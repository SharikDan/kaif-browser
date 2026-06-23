const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  showContextMenu: (link) => ipcRenderer.send('context-menu', link),
  onOpenNewTab: (callback) => ipcRenderer.on('open-new-tab', (event, link) => callback(link)),
  onRefresh: (callback) => ipcRenderer.on('refresh-page', () => callback()),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, data) => callback(data)),
  onDownloadDone: (callback) => ipcRenderer.on('download-done', (event, data) => callback(data)),
  getPasswords: () => ipcRenderer.invoke('get-passwords'),
  savePassword: (domain, username, password) => ipcRenderer.invoke('save-password', { domain, username, password }),
  getPasswordsForDomain: (domain) => ipcRenderer.invoke('get-passwords-for-domain', domain),
  getDownloadsHistory: () => ipcRenderer.invoke('get-downloads-history'),
  openDownloadFolder: (filePath) => ipcRenderer.invoke('open-download-folder', filePath),
  getSearchHistory: () => ipcRenderer.invoke('get-search-history'),
  addSearchHistory: (query) => ipcRenderer.invoke('add-search-history', query),
  clearSearchHistory: () => ipcRenderer.invoke('clear-search-history'),
  openPip: (url) => ipcRenderer.invoke('open-pip', url),
  onDownloadHistoryUpdated: (callback) => ipcRenderer.on('download-history-updated', (event, data) => callback(data)),
  onSearchHistoryUpdated: (callback) => ipcRenderer.on('search-history-updated', (event, data) => callback(data))
});