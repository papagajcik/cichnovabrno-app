const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('dk', {
  get: () => ipcRenderer.invoke('dk:get'),
  set: (k, v) => ipcRenderer.invoke('dk:set', k, v),
  act: n => ipcRenderer.invoke('dk:act', n)
});
