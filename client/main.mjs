import { app, BrowserWindow, ipcMain, shell } from "electron";
import { existsSync, statSync, readFileSync } from "fs";
import { createServer } from "http";
import { join, resolve, parse } from "path";
import { parse as _parse } from "url";

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

const server = createServer((req, res) => {
  // extract URL path
  let pathname1 = `./${
    _parse(
      join(app.isPackaged ? join(app.getAppPath(), "dist") : "dist", req.url),
    ).pathname
  }`;
  pathname1 = existsSync(pathname1)
    ? pathname1
    : existsSync(resolve(__dirname, pathname1))
      ? resolve(__dirname, pathname1)
      : `./${
          _parse(join(app.isPackaged ? "resources/app/dist" : "dist", req.url))
            .pathname
        }`;
  let pathname = existsSync(pathname1)
    ? pathname1
    : resolve(__dirname, pathname1);
  // based on the URL path, extract the file extension. e.g. .js, .doc, ...
  const ext = parse(pathname).ext;

  if (existsSync(pathname)) {
    // if is a directory search for index file matching the extension
    if (statSync(pathname).isDirectory()) pathname += "/index" + ext;
    try {
      const data = readFileSync(pathname);
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
    preload: resolve(__dirname, "preload.mjs"),
  },
};
server.listen(0, () => {
  const port = server.address().port;
  console.log("Listening on port:", port);
  const createWindow = () => {
    const win = new BrowserWindow({ ...a, show: false });
    win.webContents.setWindowOpenHandler(makeWindowOpenHandler(port));
    win.loadURL(`http://localhost:${port}/index.html`);
    win.maximize();
    win.show();
    win.webContents.on("did-finish-load", () => {
      win.webContents.setZoomFactor(0.9);
    });
    ipcMain.handle("title-bar", (_e, background, foreground) => {
      const win2 = BrowserWindow.getAllWindows().find(
        (c) => c.webContents.id === _e.sender.id,
      );
      if (win2 && "setTitleBarOverlay" in win2) {
        win2.setTitleBarOverlay({
          color: background,
          symbolColor: foreground,
        });
      }
    });
  };
  app.whenReady().then(() => {
    createWindow();
  });
  app.on("browser-window-created", (e, w) => {
    w.webContents.setWindowOpenHandler(makeWindowOpenHandler(port));
  });
  app.on("window-all-closed", () => {
    app.quit();
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
      shell.openExternal(url);
      return { action: "deny" };
    }
  };
}
