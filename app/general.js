const { BrowserWindow, dialog, Tray, Menu, session } = require("electron");
const fs = require('fs');
const path = require("path");

global.shared = {
    userAgent: null,
    perms : { //here defined the default *disabled* permissions (are TRUE) 
            }
};

function SetUserAgent(value) {
    global.shared = { userAgent: value };
}

/////////////////////////////////////////
///////////////////// INSTANTIATE [start]
var tray = null;
var windowIndex = 0;  //attached to each /window opened/ at OpenNewWindow, later used on tray click - https://www.electronjs.org/docs/latest/api/tray - later found BrowserWindow.webContents.id

function TrayIcon() {
    tray = new Tray(path.join(__dirname, "assets", "gmail_blue.ico"));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'show', click: () => { BrowserWindow.getAllWindows()[BrowserWindow.getAllWindows().length - 1].show();} },
        { label: 'set all read', click: () => {  tray.windowIndex = undefined; tray.setImage(path.join(__dirname, "assets", "gmail_blue.ico")); tray.setToolTip('PipisCrew.mail desktop electron');} },
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
        for (const w of BrowserWindow.getAllWindows()) {
            if (w.windowIndex === tray.windowIndex) {
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
    let filePath = path.join(__dirname, 'settings.json');
    let filePerms = { //app defaults
        clipboard_read: false,
        clipboard_sanitized_write: true,
        display_capture: true,
        fullscreen: false,
        geolocation: true,
        idle_detection: true,
        media: true,
        mediaKeySystem: false,
        midi: true,
        midiSysex: true,
        notifications: true,
        pointerLock: false,
        keyboardLock: false,
        openExternal: false,
        window_management: true,
        background_sync: true,
        unknown: true
    };

    if (fs.existsSync(filePath)) {
        // console.log("file found!");
        let data = fs.readFileSync(filePath, 'utf8');
        filePerms = JSON.parse(data);
    } 
    // console.log("--filePerms--");
    // console.log(filePerms);
    
    global.shared.perms = {
        clipboard_read: filePerms.clipboard_read,
        clipboard_sanitized_write: filePerms.clipboard_sanitized_write,
        display_capture: filePerms.display_capture,
        fullscreen: filePerms.fullscreen,
        geolocation: filePerms.geolocation,
        idle_detection: filePerms.idle_detection,
        media: filePerms.media,
        mediaKeySystem: filePerms.mediaKeySystem,
        midi: filePerms.midi,
        midiSysex: filePerms.midiSysex,
        notifications: filePerms.notifications,
        pointerLock: filePerms.pointerLock,
        keyboardLock: filePerms.keyboardLock,
        openExternal: filePerms.openExternal,
        window_management: filePerms.window_management,
        background_sync:filePerms.background_sync,
        unknown: filePerms.unknown
    };
    // console.log("--global.shared.perms--");
    // console.log("filePerms.media - " + filePerms.media);
}

function CheckPermission(permission) { // greets to AI
    // Convert the permission string to lowercase for case-insensitive comparison 
    const lowercasePermission = permission.toLowerCase().replace("-","_").replace("-","_");

    if (global.shared.perms.hasOwnProperty(lowercasePermission)) {
        return global.shared.perms[lowercasePermission];
    } else { //by default DECLINE any unknowm permission
        return true;
    }
}

function SetPermissionsPartition(partitionName){ //https://www.electronjs.org/docs/latest/api/session#sessionfrompathpath-options - https://blog.doyensec.com/2022/09/27/electron-api-default-permissions.html
    session.fromPartition(partitionName).setPermissionRequestHandler((webContents, permission, callback) => {
        // console.log("setPermissionRequestHandler -- " + webContents.getURL() + " - " + permission + ' - ' + (!CheckPermission(permission)));
        return callback(!CheckPermission(permission));
    })
  
    session.fromPartition(partitionName).setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    //   console.log("setPermissionCheckHandler -- " + requestingOrigin + " - " + permission + ' - ' + (!CheckPermission(permission)));  
      return !CheckPermission(permission); 
    })
}

function SetPermissionsDefaultPartition(){ //https://www.electronjs.org/docs/latest/api/session#sessiondefaultsession
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        // console.log("setPermissionRequestHandler -- " + webContents.getURL() + " - " + permission + ' - ' + (!CheckPermission(permission)));
        return callback(!CheckPermission(permission));
    })
  
    session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    //   console.log("setPermissionCheckHandler -- " + requestingOrigin + " - " + permission + ' - ' + (!CheckPermission(permission)));  
      return !CheckPermission(permission); 
    })
}
///////////////////// PERMISSIONS SET [end]
////////////////////////////////////////////


function OpenNewWindow(url, partitionName, icon_name) {

    // let countBrowsers = BrowserWindow.getAllWindows().length;

    //identification - used only when user wants to #show# the associate browser by the tray notification (using the option 'Show')
    windowIndex++;

    let wordwindow = new BrowserWindow({
        width: 1181,
        height: 670,
        show: (windowIndex != 1), //when app starts, is hidden to tray by default
        partit: partitionName,
        icon: path.join(__dirname, "assets", "" + icon_name), //even null (aka open in new window options) inherit from mainBrowserWindow without error
        webPreferences: {
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            sandbox: true,
            webgl: false,
            contextIsolation: true,
            partition: partitionName,
        },
    });

    wordwindow.partitionName = partitionName;
    wordwindow.windowIndex = windowIndex;

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

    wordwindow.loadURL(url, { userAgent: global.shared.userAgent });  // access via general.global.shared.userAgent - UPDATE no used anymore ;)

    //subscribe to TRAY event - on title change - icon_name means only for the app /default/ websites (aka no the new child windows opened across)
    if (icon_name) {
        const iconFilepath = path.join(__dirname, "assets", "" + icon_name);
        wordwindow.webContents.on('page-title-updated', (event, title) => {
            // console.log('Page title updated:', title);

            if (title.indexOf("(") > 0) {
                tray.setImage(iconFilepath);
                tray.setToolTip(title);
                tray.windowIndex = wordwindow.windowIndex;  //used on LeftClick - tray.on('click'
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

            ShowMessageBox(`PDF generated successfully to ${pdfPath}`);
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

module.exports = { global, SetUserAgent, OpenNewWindow, SavePDF, ShowMessageBox, TrayIcon, LoadPermissions };

/* as found at
https://iamveryhungry.medium.com/share-data-using-global-d141cfc21b7d
https://ishwar-rimal.medium.com/generating-pdf-with-electron-js-31b59ac93249

--

changes:
* remove functionalities & packages (specially the **electron-store** which have reference to https://www.npmjs.com/package/conf - omg!)
* user agent - can defined at useragent.txt (near the executable, user has to create it)
* mouse context new options - 'save as pdf' & 'open in default browser'
* top menu - add multiple sites playing isolated by each other (aka partitions)
* top menu - user can open a 'custom url' by clipboard to the current partition
* top menu - user can set page permissions
* prevent multi instances (in case there is no application window and when running the application doing nothing, TERMINATE the process 'mail_desktop_electron'. This happens when previously app is crashed)
* compiled under the traditional [electron-packager](https://github.com/electron/packager)

*/