const {
  app,
  dialog,
  BrowserWindow,
  ShareMenu,
  clipboard,
} = require("electron");
// const { shell } = require("electron");
const openAboutWindow = require("about-window").default;
const path = require("path");
const general = require("./general");
const permissions_cfg = require("./permissions_cfg");


async function openExternalLink(url) {
  const { shell } = require("electron");
  await shell.openExternal(url);
}

async function openLogsFolder() {
  const { shell } = require("electron");
  if (process.platform === "win32") {
    await shell.openPath(
      "C:\\Users\\" +
      process.env.USERNAME +
      "\\AppData\\Roaming\\mail_desktop_electron\\"
    );
  } else if (process.platform === "darwin") {
    await shell.openPath(
      "/Users/" + process.env.USER + "/Library/Logs/mail_desktop_electron/"
    );
  } else if (process.platform === "linux") {
    await shell.openPath(
      "/home/" + process.env.USER + "/.config/mail_desktop_electron/logs/"
    );
  }
}

/*
  https://www.electronjs.org/docs/latest/api/menu
  https://www.electronjs.org/docs/latest/api/menu-item#menuitemenabled
*/
const menulayout = [
  ...(process.platform === "darwin"
    ? [
      {
        label: app.name,
        submenu: [
          {
            label: "about mail_desktop_electron",
            click: () => {
              openAboutWindow({
                icon_path: path.join(__dirname, "assets", "about.png"),
                product_name: "mail_desktop_electron",
                copyright:
                  "All third-party libraries/images are copyrighted by their respective owners.",
                package_json_dir: __dirname + "/../",
                bug_report_url: "https://pipiscrew.com",
                bug_link_text: "home",
                adjust_window_size: "2",
                show_close_button: "Close",
              });
            },
          },
          {
            label: "open profile folder",
            click: async () => {
              await openLogsFolder();
            },
          },
          { type: "separator" },
          {
            label: "Preferences",
            submenu: [
              {
                label: "user agent",
                click: () => {
                  const options = {
                    type: "info",
                    buttons: ["Ok"],
                    defaultId: 2,
                    title: "Info",
                    message: "create or edit",
                    detail: path.join(process.cwd(), "useragent.txt"),
                  };
                  dialog.showMessageBox(null, options, (response) => {
                    console.log(response);
                  });
                }
              },
              { type: "separator" },
              ...(process.platform === "win32" || process.platform === "linux"
                ? [
                  {
                    label: 'exit',
                    accelerator: 'Ctrl+Q',
                    click: () => { app.quit(); },
                  }
                ]
                : []),
            ],
          },
          { role: "services" },
          { type: "separator" },
          { label: "Hide mail_desktop_electron", role: "hide" },
          { role: "hideOthers" },
          { role: "unhide" },
          { type: "separator" },
          { label: "Quit mail_desktop_electron", role: "quit" },
        ],
      },
    ]
    : []),
  ...(process.platform === "win32" || process.platform === "linux"
    ? [
      {
        label: "#",
        submenu: [
          {
            label: "about mail_desktop_electron",
            icon: path.join(__dirname, "assets", "about16.png"),
            click: () => {
              openAboutWindow({
                icon_path: path.join(__dirname, "assets", "about.png"),
                product_name: "mail_desktop_electron",
                copyright: "All third-party libraries/images are copyrighted by their respective owners.",
                package_json_dir: __dirname + "/../",
                bug_report_url: "https://pipiscrew.com",
                bug_link_text: "home",
                adjust_window_size: "2",
                show_close_button: "Close",
                win_options: { title: 'about', resizable: false, maximizable: false }
              });
            },
          },
          { type: "separator" },
          {
            label: "website permissions",
            click: () => {
              permissions_cfg.createConfigWindow();
            },
          },
          {
            label: "test",
            submenu: [
              { label: "webRTC", icon: path.join(__dirname, "assets", "shield1.png"), click: () => { general.OpenNewWindow("https://browserleaks.com/webrtc"); }, },
              { label: "user agent", icon: path.join(__dirname, "assets", "shield2.png"), click: () => { general.OpenNewWindow("https://www.whatismybrowser.com/detect/what-is-my-user-agent/"); }, },
              { label: "canvas", icon: path.join(__dirname, "assets", "shield3.png"), click: () => { general.OpenNewWindow("https://browserleaks.com/canvas"); }, },
            ]
          },
          { type: "separator" },
          {
            label: "open profile folder",
            click: async () => {
              await openLogsFolder();
            },
          },
          {
            label: "user agent",
            click: () => {
              const options = {
                type: "info",
                buttons: ["Ok"],
                defaultId: 2,
                title: "Info",
                message: "create or edit",
                detail: path.join(process.cwd(), "useragent.txt"),
              };
              dialog.showMessageBox(null, options, (response) => {
                console.log(response);
              });
            }
          },
          { type: "separator" },
          ...(process.platform === "win32" || process.platform === "linux"
            ? [
              {
                label: 'exit',
                accelerator: 'Ctrl+Q',
                click: () => { app.quit(); },
              }
            ]
            : []),
        ],
      },
    ]
    : []),
  {
    label: "File",
    submenu: [
      {
        label: "close window",
        icon: path.join(__dirname, "assets", "close16.png"),
        accelerator: "CmdOrCtrl+W",
        click: () => {
          try {
            BrowserWindow.getFocusedWindow().close();
          } catch {
            return;
          }
        },
      },
      {
        label: "close all windows",
        // icon: path.join(__dirname, "assets", "closeA16.png",
        accelerator: "CmdOrCtrl+Shift+W",
        click: () => {
          BrowserWindow.getAllWindows().forEach((window) => {
            window.close();
          });
        },
      },
      { type: "separator" },
      {
        label: "resize all to default",
        click: () => {
          BrowserWindow.getAllWindows().forEach((window) => {
            window.setSize(1181,670); 
            window.restore();
          });
        },
      },
      {
        label: "minimize all windows",
        click: () => {
          BrowserWindow.getAllWindows().forEach((window) => {
            console.log(window);
            window.minimize();
          });
        },
      },
      { type: "separator" },
      {
        label: "copy URL to clipboard",
        icon: path.join(__dirname, "assets", "clipboard16.png"),
        accelerator: "CmdOrCtrl+Shift+C",
        click: () => {
          clipboard.writeText(BrowserWindow.getFocusedWindow().webContents.getURL());
        },
      },
      ...(process.platform === "darwin"
        ? [
          {
            label: "Share...",
            click: () => {
              let sharemenu = new ShareMenu({
                urls: [BrowserWindow.getFocusedWindow().webContents.getURL()],
                texts: [BrowserWindow.getFocusedWindow().getTitle()],
              });
              sharemenu.popup();
            },
          },
        ]
        : []),
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...(process.platform === "darwin"
        ? [
          { role: "pasteAndMatchStyle" },
          { role: "delete" },
          { role: "selectAll" },
          { type: "separator" },
          {
            label: "Speech",
            submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
          },
        ]
        : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
    ],
  },
  {
    label: "Navigation",
    submenu: [
      { label: "Back", icon: path.join(__dirname, "assets", "back16.png"), click: () => { BrowserWindow.getFocusedWindow().webContents.goBack(); }, accelerator: "Alt+Left" },
      { label: "Forward", icon: path.join(__dirname, "assets", "forward16.png"), click: () => { BrowserWindow.getFocusedWindow().webContents.goForward(); }, accelerator: "Alt+Right" },
      { type: "separator" },
      { label: "Reload", icon: path.join(__dirname, "assets", "reload16.png"), click: () => { BrowserWindow.getFocusedWindow().webContents.reload(); }, accelerator: "CmdOrCtrl+R" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload", icon: path.join(__dirname, "assets", "reload16.png") },
      { role: "forceReload", icon: path.join(__dirname, "assets", "reloadF16.png") },
      { type: "separator" },
      { role: "resetZoom" },
      {
        role: "zoomIn",
        accelerator: process.platform === "darwin" ? "Control+=" : "Control+=",
      },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
      { type: "separator" },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function () {
          if (process.platform === 'darwin')
            return 'Alt+Command+I';
          else
            return 'F12';//'Ctrl+Shift+I';
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },

    ],
  },
  {
    label: "OPEN",
    submenu: [
      { label: "gmail1", icon: path.join(__dirname, "assets", "gmail16.png"), click: () => { general.OpenNewWindow("https://mail.google.com/mail/u/0/#inbox", "persist:gmail1", "gmail16.png"); }, },
      { label: "gmail2", icon: path.join(__dirname, "assets", "gmail16.png"), click: () => { general.OpenNewWindow("https://mail.google.com/mail/u/0/#inbox", "persist:gmail2", "gmail16.png"); }, },
      { label: "github", icon: path.join(__dirname, "assets", "github16.png"), click: () => { general.OpenNewWindow("https://www.github.com", "persist:github", "github16.png"); }, },
      { label: "hotmail1", icon: path.join(__dirname, "assets", "outlook16.png"), click: () => { general.OpenNewWindow("https://login.live.com", "persist:hotmail1", "outlook16.png"); }, },
      { label: "hotmail2", icon: path.join(__dirname, "assets", "outlook16.png"), click: () => { general.OpenNewWindow("https://login.live.com", "persist:hotmail2", "outlook16.png"); }, },
      { label: "linkedin", icon: path.join(__dirname, "assets", "linkedin16.png"), click: () => { general.OpenNewWindow("https://www.linkedin.com", "persist:linkedin", "linkedin16.png"); }, },
      { label: "yahoo", icon: path.join(__dirname, "assets", "yahoo16.png"), click: () => { general.OpenNewWindow("https://mail.yahoo.com", "persist:yahoo", "yahoo16.png"); }, },
      { label: "telegram", icon: path.join(__dirname, "assets", "telegram16.png"), click: () => { general.OpenNewWindow("https://web.telegram.org", "persist:telegram", "telegram16.png"); }, },
      { label: "discord", icon: path.join(__dirname, "assets", "discord16.png"), click: () => { general.OpenNewWindow("https://discord.com/channels/@me", "persist:discord", "discord16.png"); }, },
      { label: "proton", icon: path.join(__dirname, "assets", "proton16.png"), click: () => { general.OpenNewWindow("https://mail.protonmail.com", "persist:proton", "proton16.png"); }, },
      { label: "twitter", icon: path.join(__dirname, "assets", "twitter16.png"), click: () => { general.OpenNewWindow("https://www.twitter.com", "persist:twitter", "twitter16.png"); }, },
      { label: "messenger", icon: path.join(__dirname, "assets", "messenger16.png"), click: () => { general.OpenNewWindow("https://www.messenger.com", "persist:messenger", "messenger16.png"); }, },
      { type: "separator" },
      {
        label: "open w/ cookies",
        icon: path.join(__dirname, "assets", "open_in_container.png"),
        sublabel: "clipboard",
        click: () => {
          if (!clipboard.readText().toLowerCase().startsWith('http'))
            general.ShowMessageBox("the options 'open x' work when there is a URL to clipboard");
          else 
            general.OpenNewWindow(clipboard.readText(), BrowserWindow.getFocusedWindow().partitionName); 
        },
      },
        {
          label: "open",
          icon: path.join(__dirname, "assets", "open_in_global.png"),
          sublabel: "clipboard",
          click: () => {
            if (!clipboard.readText().toLowerCase().startsWith('http'))
              general.ShowMessageBox("the options 'open x' work when there is a URL to clipboard");
            else 
              general.OpenNewWindow(clipboard.readText(), null); 
        },
      },
    ],
  },
];
module.exports = { menulayout };
