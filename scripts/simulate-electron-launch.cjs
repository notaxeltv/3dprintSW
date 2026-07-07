/**
 * Simula la logica di electron/main.cjs (gestione dati utente, junction uploads,
 * avvio server standalone) SENZA passare per l'eseguibile Electron, utile per
 * verificare la correttezza quando l'exe stesso è bloccato da policy locali
 * (es. Windows Smart App Control) durante lo sviluppo.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

const root = path.join(__dirname, "..");
const resourcesDir = path.join(root, "dist-electron-out", "win-unpacked", "resources");
const appServerDir = path.join(resourcesDir, "app-server");
const nodeExe = path.join(resourcesDir, "node", "node.exe");
const fakeUserData = path.join(root, ".sim-userdata");
const PORT = 3133;

fs.rmSync(fakeUserData, { recursive: true, force: true });
const dataDir = path.join(fakeUserData, "data");
const uploadsDir = path.join(fakeUserData, "uploads");
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const dbPath = path.join(dataDir, "app.db");
fs.copyFileSync(path.join(resourcesDir, "template", "app-template.db"), dbPath);

const serverPublicUploads = path.join(appServerDir, "public", "uploads");
if (fs.existsSync(serverPublicUploads)) {
  fs.rmSync(serverPublicUploads, { recursive: true, force: true });
}
fs.symlinkSync(uploadsDir, serverPublicUploads, "junction");
console.log("Junction uploads creata:", serverPublicUploads, "->", uploadsDir);

const child = spawn(nodeExe, [path.join(appServerDir, "server.js")], {
  cwd: appServerDir,
  env: { ...process.env, PORT: String(PORT), HOSTNAME: "127.0.0.1", NODE_ENV: "production", DATABASE_URL: `file:${dbPath}` },
});

child.stdout.on("data", (d) => process.stdout.write(`[server] ${d}`));
child.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));

function waitReady(retries = 30) {
  http
    .get(`http://127.0.0.1:${PORT}/api/stats`, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", async () => {
        console.log("\n/api/stats ->", res.statusCode, body);

        // Test scrittura upload: crea un file finto e verifica che sia servito
        // tramite /uploads/<nome> passando per la junction.
        const testFile = "verifica.png";
        fs.writeFileSync(path.join(uploadsDir, testFile), "contenuto di prova");
        http.get(`http://127.0.0.1:${PORT}/uploads/${testFile}`, (res2) => {
          let body2 = "";
          res2.on("data", (c) => (body2 += c));
          res2.on("end", () => {
            console.log(`/uploads/${testFile} ->`, res2.statusCode, JSON.stringify(body2));
            child.kill();
            process.exit(0);
          });
        }).on("error", (e) => {
          console.error("Errore richiesta upload:", e.message);
          child.kill();
          process.exit(1);
        });
      });
    })
    .on("error", () => {
      if (retries <= 0) {
        console.error("Timeout in attesa del server");
        child.kill();
        process.exit(1);
      } else {
        setTimeout(() => waitReady(retries - 1), 400);
      }
    });
}

waitReady();
