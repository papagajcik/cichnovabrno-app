const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('mini', {
  onState: cb => ipcRenderer.on('state', (e, s) => cb(s)),
  close: () => ipcRenderer.send('mini-close')
});
