const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  showContextMenu: (link) => ipcRenderer.send('context-menu', link),

  // Return unsubscribe functions so renderer can avoid duplicate listeners
  onOpenNewTab: (callback) => {
    const listener = (event, link) => callback(link);
    ipcRenderer.on('open-new-tab', listener);
    return () => ipcRenderer.removeListener('open-new-tab', listener);
  },
  onRefresh: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('refresh-page', listener);
    return () => ipcRenderer.removeListener('refresh-page', listener);
  },
  onDownloadStarted: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('download-started', listener);
    return () => ipcRenderer.removeListener('download-started', listener);
  },
  onDownloadProgress: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('download-progress', listener);
    return () => ipcRenderer.removeListener('download-progress', listener);
  },
  onDownloadDone: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('download-done', listener);
    return () => ipcRenderer.removeListener('download-done', listener);
  },

  openDownloadFolder: (folderPath) => ipcRenderer.invoke('open-download-folder', folderPath),
  getPasswords: () =&gt; ipcRenderer.invoke('get-passwords'),
  savePassword: (domain, username, password) =&gt; ipcRenderer.invoke('save-password', { domain, username, password }),
  getPasswordsForDomain: (domain) =&gt; ipcRenderer.invoke('get-passwords-for-domain', domain)
});
