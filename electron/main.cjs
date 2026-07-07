const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { spawn } = require("child_process");

const APP_NAME = "3DPrintSW";
const PORT = 3131;

let serverProcess = null;
let mainWindow = null;

let logStream = null;
function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(" ")}`;
  try {
    if (!logStream) {
      const logPath = path.join(app.getPath("userData"), "app.log");
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      logStream = fs.createWriteStream(logPath, { flags: "a" });
    }
    logStream.write(line + "\n");
  } catch {
    // ignora errori di logging
  }
}

function resourcesPath() {
  return app.isPackaged
    ? process.resourcesPath
    : path.join(__dirname, "..", "electron", "resources");
}

function appServerDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "app-server")
    : path.join(__dirname, "..");
}

function nodeExePath() {
  const bundled = path.join(resourcesPath(), "node", "node.exe");
  if (fs.existsSync(bundled)) return bundled;
  return process.execPath; // fallback: usa Electron stesso in modalità dev
}

function ensureUserData() {
  const userData = app.getPath("userData");
  const dataDir = path.join(userData, "data");
  const uploadsDir = path.join(userData, "uploads");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(uploadsDir, { recursive: true });

  const dbPath = path.join(dataDir, "app.db");
  log("resourcesPath:", resourcesPath());
  log("appServerDir:", appServerDir());
  log("nodeExePath:", nodeExePath());
  log("dbPath:", dbPath, "exists:", fs.existsSync(dbPath));
  if (!fs.existsSync(dbPath)) {
    const template = path.join(resourcesPath(), "template", "app-template.db");
    log("template db:", template, "exists:", fs.existsSync(template));
    if (fs.existsSync(template)) {
      fs.copyFileSync(template, dbPath);
    }
  }

  // Reindirizza public/uploads del server verso i dati persistenti utente,
  // così l'app (che scrive/legge da process.cwd()/public/uploads) non perde
  // le immagini caricate quando l'eseguibile portable viene riestratto.
  const serverPublicUploads = path.join(appServerDir(), "public", "uploads");
  try {
    const stat = fs.existsSync(serverPublicUploads)
      ? fs.lstatSync(serverPublicUploads)
      : null;
    const isJunctionToUserUploads =
      stat && stat.isSymbolicLink() && fs.realpathSync(serverPublicUploads) === fs.realpathSync(uploadsDir);

    if (!isJunctionToUserUploads) {
      if (stat) {
        fs.rmSync(serverPublicUploads, { recursive: true, force: true });
      } else {
        fs.mkdirSync(path.join(appServerDir(), "public"), { recursive: true });
      }
      fs.symlinkSync(uploadsDir, serverPublicUploads, "junction");
    }
  } catch (err) {
    console.error("Impossibile collegare la cartella uploads:", err);
  }

  return { dbPath, uploadsDir };
}

function waitForServer(port, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get({ host: "127.0.0.1", port, path: "/", timeout: 1500 }, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error("Timeout in attesa del server"));
        } else {
          setTimeout(tryOnce, 300);
        }
      });
      req.on("timeout", () => req.destroy());
    };
    tryOnce();
  });
}

function startServer() {
  const { dbPath } = ensureUserData();
  const serverDir = appServerDir();
  const serverEntry = path.join(serverDir, "server.js");

  const env = {
    ...process.env,
    PORT: String(PORT),
    HOSTNAME: "127.0.0.1",
    NODE_ENV: "production",
    DATABASE_URL: `file:${dbPath}`,
    ELECTRON_RUN_AS_NODE: "1",
  };

  log("Avvio server:", nodeExePath(), serverEntry, "cwd:", serverDir);
  log("serverEntry exists:", fs.existsSync(serverEntry));

  serverProcess = spawn(nodeExePath(), [serverEntry], {
    cwd: serverDir,
    env,
    windowsHide: true,
  });

  serverProcess.stdout.on("data", (d) => log("[server stdout]", d.toString().trim()));
  serverProcess.stderr.on("data", (d) => log("[server stderr]", d.toString().trim()));

  serverProcess.on("error", (err) => {
    log("[server spawn error]", err.message);
  });

  serverProcess.on("exit", (code) => {
    log("[server exit]", "code:", code);
    if (code !== 0 && mainWindow) {
      dialog.showErrorBox(APP_NAME, `Il server dell'app si è arrestato inaspettatamente (codice ${code}).`);
    }
  });

  return waitForServer(PORT);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 600,
    title: APP_NAME,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    log("app ready, isPackaged:", app.isPackaged);
    await startServer();
    log("server pronto, apro finestra");
    createWindow();
  } catch (err) {
    log("[fatal]", err.stack || err.message);
    dialog.showErrorBox(APP_NAME, `Impossibile avviare l'applicazione:\n${err.message}`);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
