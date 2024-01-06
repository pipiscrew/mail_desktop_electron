const { app, Menu, dialog } = require("electron");
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

// // Set the user data directory before creating the BrowserWindow - https://www.electronjs.org/docs/latest/api/app#appgetpathname
app.setPath('userData', path.join(process.cwd(), "profile")); //on startup electron creates by default %appdata%/appname/locked
// // app.setPath('logs', path.join(process.cwd(), "profile"));
// // app.setPath('temp', path.join(process.cwd(), "profile"));

if (process.argv.slice(1).includes('clean')) {
  console.log("/\/\/\/ - clean profile");
  general.CleanProfile(path.join(process.cwd(), "profile"));
  console.log("/\/\/\/ - press enter to exit");
  app.exit(0);
  return;
}


app.commandLine.appendSwitch("no-proxy-server");
app.commandLine.appendSwitch("disable-reading-from-canvas");
app.disableHardwareAcceleration(); //(same as app.commandLine.appendSwitch("disable-gpu");) //https://hardwaretester.com/gpu already /unknown/ by default - GPU is up and running always (software or hardware). - https://www.electronjs.org/docs/latest/api/command-line
app.commandLine.appendSwitch("disable-software-rasterizer"); //src - https://github.com/electron/electron/issues/20702
// 
// app.commandLine.appendSwitch("enable-media-stream", "0"); //does not take any place - use # > web permissions
// app.commandLine.appendSwitch("disable-webgl"); //does not take any place rather we must use BrowserWindow.webPreferences.webgl: false
// ref - https://www.electronjs.org/docs/latest/api/command-line-switches - https://peter.sh/experiments/chromium-command-line-switches/
//
//https://github.com/electron/electron/blob/73e7125041339bf0fc319242a00fdb75d4554895/docs/api/app.md?plain=1#L480
// console.log(app.getAppMetrics());
// console.log(app.getGPUFeatureStatus());

// return;

//validate internet connectivity on startup
fetch('https://mail.google.com', {cache: "no-store"})
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
        general.OpenNewWindow(parameters.linkURL, browserWindow.partitionName) //BrowserWindow.getFocusedWindow().partitionName )
        // console.log( parameters.linkURL);
      }
    },
    {
      label: 'Open in new window',
      visible: parameters.linkURL.length > 0 && parameters.mediaType === 'none',
      click: () => {
        general.OpenNewWindow(parameters.linkURL, null)
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


  //load permissions
  // console.log (general.LoadPermissions());

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

