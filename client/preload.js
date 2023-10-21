process.once("loaded", () => {
  const { contextBridge, ipcRenderer } = require("electron");

  contextBridge.exposeInMainWorld("electron", {
    async invoke(eventName, ...params) {
      return await ipcRenderer.invoke(eventName, ...params);
    },
  });
});
