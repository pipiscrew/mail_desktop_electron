const { app, Menu, BrowserWindow, dialog, session } = require("electron");
const fs = require('fs');
const ElectronDl = require("electron-dl");
const contextMenu = require("electron-context-menu");
const path = require("path");
const { menulayout } = require("./menu");
const { shell } = require("electron");
const general = require("./general");

const singleInstance = app.requestSingleInstanceLock();

if (!singleInstance) {
  console.log("Another instance is running please switch to it");
  app.exit(0);
} 

//validate internet connectivity on startup
fetch('https://mozilla.org')
  .then(response => {
    if (!response.ok) {
      throw new Error('Server not reachable');
    }
    console.log('Server is reachable!');
  })
  .catch(error => {

    app.exit(0);

    const options = {
      type: "warning",
      buttons: ["Ok"],
      defaultId: 2,
      title: "Warning",
      message: "You appear to be offline!",
      detail:
        "Please check your Internet Connectivity. This app cannot run without an Internet Connection!",
    };
    dialog.showMessageBox(null, options, (response) => {
      console.log(response);
    });
    return;
  });

//app.commandLine.appendSwitch("disable-gpu");
// app.commandLine.appendSwitch("disable-media-stream");
// session.defaultSession.setPermissionRequestHandler(null);



//SHARED across - download in electron
ElectronDl({
  dlPath: "./downloads",
  onStarted: (item) => {
    dialog.showMessageBox({
      type: "info",
      title: "Downloading File",
      message: `Downloading "${item.getFilename()}" to "${item.getSavePath()}"`,
      buttons: ["OK"],
    });
  },
  onCompleted: () => {
    dialog.showMessageBox({
      type: "info",
      title: "Download Completed",
      message: `Downloading Completed! Please check your USER > "Downloads" folder.`,
      buttons: ["OK"],
    });
  },
  onError: (item) => {
    dialog.showMessageBox({
      type: "error",
      title: "Download failed",
      message: `Downloading "${item.getFilename()}" failed :(`,
      buttons: ["OK"],
    });
  },
});

//SHARED across - BrowserWindows - customize mouse context menu
contextMenu({ // https://github.com/sindresorhus/electron-context-menu
  showInspectElement: true,
  showServices: true, //macOS only, no tested
  showCopyLink: true,
  prepend: (defaultActions, parameters, browserWindow) => [
    defaultActions.separator(),
    {
      label: 'Open in new window w/ cookies',
      visible: parameters.linkURL.length > 0 && parameters.mediaType === 'none',
      click: () => {
        // console.log(browserWindow.partitionName);
        general.OpenNewWindow( parameters.linkURL, browserWindow.partitionName ) //BrowserWindow.getFocusedWindow().partitionName )
        // console.log( parameters.linkURL);
      }
    },
    {
      label: 'Open in new window',
      visible: parameters.linkURL.length > 0 && parameters.mediaType === 'none',
      click: () => {
        general.OpenNewWindow( parameters.linkURL, null )
      }
    },
    {
      label: 'Open in default browser',
      visible: parameters.linkURL.length > 0 && parameters.mediaType === 'none',
      click: () => {
        shell.openExternal(parameters.linkURL);
      }
    },
    defaultActions.separator(),
    {
      label: 'Export as pdf',
      click: () => {
        general.SavePDF();
      }
    }
  ]
});

//SHARED accross BrowserWindows - configure BROWSER menu
Menu.setApplicationMenu(Menu.buildFromTemplate(menulayout));



app.on("ready", () => {
  //when useragent defined apply it cross BrowserWindows
  if (BrowserWindow.getAllWindows().length === 0) {
    let f = path.join(process.cwd(), "useragent.txt");
    if (fs.existsSync(f))
      general.SetUserAgent(fs.readFileSync(f, 'utf-8'));
  }

  //load permissions
  general.LoadPermissions();
  
  //create icon
  general.TrayIcon();
  
  //open default
  general.OpenNewWindow("https://mail.google.com/mail/u/0/#inbox", "persist:gmail1", "gmail16.png");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  if (process.platform === "darwin") {
    app.dock.setIcon(null);
  }
});
