const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Управление окном
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // Контекстное меню
  showContextMenu: (link) => ipcRenderer.send('context-menu', link),
  
  // Слушатели событий из главного процесса
  onOpenNewTab: (callback) => ipcRenderer.on('open-new-tab', (event, link) => callback(link)),
  onRefresh: (callback) => ipcRenderer.on('refresh-page', () => callback())
});