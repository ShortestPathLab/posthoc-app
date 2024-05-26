const electron = require("electron");
const fs = require("fs");
const http = require("http");
const path = require("path");
const url = require("url");

const map = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  // extract URL path
  let pathname1 = `./${
    url.parse(
      path.join(
        electron.app.isPackaged
          ? path.join(electron.app.getAppPath(), "dist")
          : "dist",
        req.url
      )
    ).pathname
  }`;
  pathname1 = fs.existsSync(pathname1)
    ? pathname1
    : fs.existsSync(path.resolve(__dirname, pathname1))
    ? path.resolve(__dirname, pathname1)
    : `./${
        url.parse(
          path.join(
            electron.app.isPackaged ? "resources/app/dist" : "dist",
            req.url
          )
        ).pathname
      }`;
  let pathname = fs.existsSync(pathname1)
    ? pathname1
    : path.resolve(__dirname, pathname1);
  // based on the URL path, extract the file extension. e.g. .js, .doc, ...
  const ext = path.parse(pathname).ext;

  if (fs.existsSync(pathname)) {
    // if is a directory search for index file matching the extension
    if (fs.statSync(pathname).isDirectory()) pathname += "/index" + ext;
    try {
      const data = fs.readFileSync(pathname);
      // if the file is found, set Content-type and send data
      res.setHeader("Content-type", map[ext] || "text/plain");
      res.end(data);
    } catch (e) {
      res.statusCode = 500;
      res.end(`Error getting the file: ${e}.`);
    }
  } else {
    // if the file is not found, return 404
    res.statusCode = 404;
    res.end(`File ${pathname} not found!`);
  }
});

/**
 * @type import("electron").BrowserWindowConstructorOptions
 */
const a = {
  autoHideMenuBar: true,
  center: true,
  titleBarStyle: "hidden",
  titleBarOverlay: {
    height: 32,
    color: "#00000000",
    symbolColor: "#00000000",
  },
  resizable: true,
  webPreferences: {
    zoomFactor: 0.9,
    preload: path.resolve(__dirname, "preload.js"),
  },
};
server.listen(0, () => {
  const port = server.address().port;
  console.log("Listening on port:", port);
  const createWindow = () => {
    const win = new electron.BrowserWindow({ ...a, show: false });
    win.webContents.setWindowOpenHandler(makeWindowOpenHandler(port));
    win.loadURL(`http://localhost:${port}/index.html`);
    win.maximize();
    win.show();
    win.webContents.on("did-finish-load", () => {
      win.webContents.setZoomFactor(0.9);
    });
    electron.ipcMain.handle("title-bar", (_e, background, foreground) => {
      const win2 = electron.BrowserWindow.getAllWindows().find(
        (c) => c.webContents.id === _e.sender.id
      );
      if (win2 && "setTitleBarOverlay" in win2) {
        win2.setTitleBarOverlay({
          color: background,
          symbolColor: foreground,
        });
      }
    });
  };
  electron.app.whenReady().then(() => {
    createWindow();
  });
  electron.app.on("browser-window-created", (e, w) => {
    w.webContents.setWindowOpenHandler(makeWindowOpenHandler(port));
  });
  electron.app.on("window-all-closed", () => {
    electron.app.quit();
  });
});

function makeWindowOpenHandler(port) {
  return ({ url }) => {
    const { host } = new URL(url);
    if (host === `localhost:${port}`) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: a,
        outlivesOpener: true,
      };
    } else {
      electron.shell.openExternal(url);
      return { action: "deny" };
    }
  };
}
