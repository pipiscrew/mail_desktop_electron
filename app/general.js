const { BrowserWindow, dialog, Tray, Menu, session } = require("electron");
const fs = require('fs');
const path = require("path");
const store = require("./store");

/////////////////////////////////////////
///////////////////// INSTANTIATE [start]
var tray = null;

function TrayIcon() {
    tray = new Tray(path.join(__dirname, "assets", "gmail_blue.ico"));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'show', click: () => { BrowserWindow.getAllWindows()[BrowserWindow.getAllWindows().length - 1].show();} },
        { label: 'set all read', click: () => { tray.windowIndex = undefined; tray.setImage(path.join(__dirname, "assets", "gmail_blue.ico")); tray.setToolTip('PipisCrew.mail desktop electron');} },
        { label: 'settings', enabled:false },
        { label: 'exit', click: () => { process.exit();} }
    ])
    tray.setToolTip('PipisCrew.mail desktop electron')
    tray.setContextMenu(contextMenu)

    //left click tay icon, restore the window which done the notification
    tray.on('click', () => {

        //case when no notification (initial gmail gray icon) - show the first browser available
        if (tray.windowIndex === undefined && BrowserWindow.getAllWindows().length > 0) {
            BrowserWindow.getAllWindows()[BrowserWindow.getAllWindows().length - 1].show();
            return;
        }

        //match the previously saved tray.windowIndex by BrowserWindow -- webContents.on('page-title-updated'
        let browserWindowFound;
        for (let w of BrowserWindow.getAllWindows()) {
            if (w.id === tray.windowIndex) {
                browserWindowFound = true;
                w.show();
                break;
            }
        }

        //case when notification exists but the browser raised is closed by the user - show the first browser available
        if (!browserWindowFound && BrowserWindow.getAllWindows().length > 0)
            BrowserWindow.getAllWindows()[BrowserWindow.getAllWindows().length - 1].show();

    });
}
///////////////////// INSTANTIATE [end]
/////////////////////////////////////////

////////////////////////////////////////////
///////////////////// PERMISSIONS SET [start]
function LoadPermissions(){
    return store.getValueOrDefault('permissions' , { "clipboard_read":false, "clipboard_sanitized_write":true, "display_capture":true, "fullscreen":false, "geolocation":true, "idle_detection":true, "media":true, "mediaKeySystem":false, "midi":true, "midiSysex":true, "notifications":true, "pointerLock":false, "keyboardLock":false, "openExternal":false, "window_management":true, "background_sync":true, "unknown":true, "useragent":undefined } ); 
}

function CheckPermission(permission) { // greets to AI
    // Convert the permission string to lowercase for case-insensitive comparison 
    const lowercasePermission = permission.toLowerCase().replace("-","_").replace("-","_");

    let perms = LoadPermissions();
    if (perms.hasOwnProperty(lowercasePermission)) {
        return perms[lowercasePermission];
    } else { //by default DECLINE any unknowm permission
        return true;
    }
}

function SetPermissionsPartition(partitionName){ //https://www.electronjs.org/docs/latest/api/session#sessionfrompathpath-options - https://blog.doyensec.com/2022/09/27/electron-api-default-permissions.html
    session.fromPartition(partitionName).setPermissionRequestHandler((webContents, permission, callback) => {
        //   console.log("setPermissionRequestHandler -- " + webContents.getURL() + " - " + permission + ' - ' + (!CheckPermission(permission)));
        return callback(!CheckPermission(permission));
    })
  
    session.fromPartition(partitionName).setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
        // console.log("setPermissionCheckHandler -- " + requestingOrigin + " - " + permission + ' - ' + (!CheckPermission(permission)));  
      return !CheckPermission(permission); 
    })
}

function SetPermissionsDefaultPartition(){ //https://www.electronjs.org/docs/latest/api/session#sessiondefaultsession
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        //   console.log("setPermissionRequestHandler -- " + webContents.getURL() + " - " + permission + ' - ' + (!CheckPermission(permission)));
        return callback(!CheckPermission(permission));
    })
  
    session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
        // console.log("setPermissionCheckHandler -- " + requestingOrigin + " - " + permission + ' - ' + (!CheckPermission(permission)));  
      return !CheckPermission(permission); 
    })
}
///////////////////// PERMISSIONS SET [end]
////////////////////////////////////////////


function OpenNewWindow(url, partitionName, icon_name) {

    const wordwindow = new BrowserWindow({
        width: 1181,
        height: 670,
        show: BrowserWindow.getAllWindows().length > 0, //when app starts, is hidden to tray by default
        icon: path.join(__dirname, "assets", "" + icon_name), //even null (aka open in new window options) inherit from mainBrowserWindow without error
        webPreferences: { //https://www.electronjs.org/docs/latest/api/structures/web-preferences
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            sandbox: true,
            webgl: false,
            contextIsolation: true,
            partition: partitionName,
        },
    });

    //assign new property - used only when using 'open w/ cookies'
    wordwindow.partitionName = partitionName;

    ///////// SET PERMISSIONS EVERY TIME [start]
    if (partitionName) {
        session.fromPartition(partitionName).setPermissionRequestHandler(null);
        SetPermissionsPartition(partitionName);
    }
    else {
        session.defaultSession.setPermissionRequestHandler(null);
        SetPermissionsDefaultPartition();
    }
    ///////// SET PERMISSIONS EVERY TIME [end]

    wordwindow.loadURL(url, { userAgent: store.load('useragent') });
    
    //subscribe to TRAY event - on title change - icon_name means only for the app /default/ websites (aka no the new child windows opened across)
    if (icon_name) {
        let iconFilepath = path.join(__dirname, "assets", "" + icon_name);
        wordwindow.webContents.on('page-title-updated', (event, title) => {
            if (title.indexOf("(") > -1) {
                tray.setImage(iconFilepath);
                tray.setToolTip(title);
                tray.windowIndex = wordwindow.id;  //used on LeftClick - tray.on('click'
            }
        });
    }
}

function SavePDF() {
    //https://github.com/electron/electron/blob/main/docs/api/web-contents.md#contentsprinttopdfoptions
    //https://stackoverflow.com/a/53966845
    // const pdfPath = path.join(os.homedir(), 'Desktop', new Date().toISOString().replace(/[-T:.]/g, '').slice(0, -5).replace('T', '_') + ".pdf");
    const pdfPath = path.join('./', new Date().toLocaleString('el-EL', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/[\/.,\s:]/g, '') + ".pdf");
    BrowserWindow.getFocusedWindow().webContents.printToPDF({ landscape: false, marginsType: 0, printBackground: false, printSelectionOnly: false, pageSize: "A4" }).then(data => {
        fs.writeFile(pdfPath, data, (error) => {
            if (error) throw error

            ShowMessageBox(`PDF generated successfully near application to file ${pdfPath}`);
        })
    }).catch(error => {
        console.log(`Failed to write PDF to ${pdfPath}: `, error)
    });
}


function ShowMessageBox(e) {
    dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), {
        type: 'info',
        title: 'Information',
        message: e,
        buttons: ['OK'],
    });
}

function isStringEmpty(str) {
    return str == null || str.trim() === '';
  }

function CleanProfile(folderPath) {
    if (!fs.existsSync(folderPath)) {
        console.error(`Folder does not exist: ${folderPath}`);
        return;
    }

    // Get a list of all items in the folder
    let items = fs.readdirSync(folderPath);

    items.forEach(item => {
        let itemPath = path.join(folderPath, item);

        if (fs.statSync(itemPath).isDirectory()) {
            if (item !== 'Network') {
                CleanProfile(itemPath);
            } else {
                console.log(`Skipping deletion of 'Network' folder: ${itemPath}`);
            }
        } else {
            //Delete file
            fs.unlinkSync(itemPath);
        }
    });

    try {
        // Delete folder
        fs.rmdirSync(folderPath);
    } catch (err) {
        // console.error('Error delete:', err);
    }
}

module.exports = { global, OpenNewWindow, SavePDF, ShowMessageBox, TrayIcon, LoadPermissions, CleanProfile, isStringEmpty };