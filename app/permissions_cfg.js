const { BrowserWindow, ipcMain } = require('electron');
// const fs = require('fs');
const path = require("path");
const general = require("./general");
const store = require("./store");

let mainWindow;
function createConfigWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, './preload.js')
    }
  });

  mainWindow.loadFile('./app/permissions_cfg.html');
  mainWindow.setMenu(null);
}

ipcMain.handle('save-data', (event, data) => {
  data.useragent = general.isStringEmpty(data.useragent) ? undefined : data.useragent;

  store.save('permissions', data);
  store.save('useragent', data.useragent);

  mainWindow.close();
  mainWindow = null;

});

ipcMain.handle('load-data', (event) => {
  return store.getValueOrDefault('permissions', { "clipboard_read": false, "clipboard_sanitized_write": true, "display_capture": true, "fullscreen": false, "geolocation": true, "idle_detection": true, "media": true, "mediaKeySystem": false, "midi": true, "midiSysex": true, "notifications": true, "pointerLock": false, "keyboardLock": false, "openExternal": false, "window_management": true, "background_sync": true, "unknown": true, "useragent": undefined }); //general.global.shared.perms; 
});

ipcMain.handle('reset-data', (event) => {
  store.save('permissions', undefined)
  store.save('useragent', undefined)

  mainWindow.close();
  mainWindow = null;
});

ipcMain.handle('app-metrics', (event) => {
  general.ShowMessageBox(JSON.stringify(app.getAppMetrics()));
});

ipcMain.handle('gpu-feature-status', (event) => {
  general.ShowMessageBox(JSON.stringify(app.getGPUFeatureStatus()));
});

module.exports = { createConfigWindow };