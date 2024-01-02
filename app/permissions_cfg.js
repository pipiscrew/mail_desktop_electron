const { BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require("path");
const general = require("./general");

let mainWindow;
function createConfigWindow() {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 900,
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, './preload.js')
      }
    });

    mainWindow.loadFile('./app/permissions_cfg.html');
    mainWindow.setMenu(null);
}

ipcMain.handle('save-data', (event, data) => {
  let filePath = path.join(__dirname, 'settings.json');
  fs.writeFileSync(filePath, JSON.stringify(data));

  general.global.shared.perms = data;

  mainWindow.close();
  mainWindow = null;
  // return data;

  // let filePath = path.join(__dirname, 'settings.json');
  // fs.writeFileSync(filePath, JSON.stringify(data));

  // savedData = data;
  // return savedData;
});

ipcMain.handle('load-data', (event) => {
  // console.log("general.global.shared.perms" + general.global.shared.perms);

  return general.global.shared.perms; 
  // let filePath = path.join(__dirname, 'settings.json');

  // if (fs.existsSync(filePath)) {
  //   let data = fs.readFileSync(filePath, 'utf8');
  //   return JSON.parse(data);
  // } else 
  //   return savedData;
});

ipcMain.handle('reset-data', (event) => {
  let filePath = path.join(__dirname, 'settings.json');
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err}`);
      } else {
        console.log('File deleted successfully.');
      }
    });    
  } 

  mainWindow.close();
  mainWindow = null;
});

module.exports = { createConfigWindow };