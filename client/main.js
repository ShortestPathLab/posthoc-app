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
  let pathname = `./${
    url.parse(
      path.join(
        electron.app.isPackaged ? "resources/app/dist" : "dist",
        req.url
      )
    ).pathname
  }`;
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
server.listen(0, () => {
  const port = server.address().port;
  console.log("Listening on port:", port);
  const createWindow = () => {
    const win = new electron.BrowserWindow({
      autoHideMenuBar: true,
      center: true,
      show: false,
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#00000000",
        symbolColor: "#00000000",
      },
      webPreferences: {
        preload: path.resolve(__dirname, "preload.js"),
      },
    });
    win.loadURL(`http://localhost:${port}/index.html`);
    win.maximize();
    win.show();
    win.webContents.on("did-finish-load", () => {
      win.webContents.setZoomFactor(0.9);
    });
    electron.ipcMain.handle("title-bar", (_e, background, foreground) => {
      win.setTitleBarOverlay({
        color: background,
        symbolColor: foreground,
      });
    });
  };
  electron.app.whenReady().then(() => {
    createWindow();
  });
  electron.app.on("window-all-closed", () => {
    electron.app.quit();
  });
});
