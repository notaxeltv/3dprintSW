/**
 * Ricrea la cartella 3DPrintSW-portable pronta per la consegna al cliente.
 * Uso: npm run portable:build
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const dest = path.join(root, "3DPrintSW-portable");
const standaloneDir = path.join(root, ".next", "standalone");
const resourcesDir = path.join(root, "electron", "resources");

function copyDir(src, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function step(label, fn) {
  process.stdout.write(`\n> ${label}...\n`);
  fn();
}

step("Build Next.js", () => {
  execFileSync("npm", ["run", "build"], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
});

step("Prepara risorse (static, public, node.exe, db template)", () => {
  execFileSync("node", ["scripts/prepare-electron-resources.cjs"], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
});

step("Rimuovo cartella portabile precedente", () => {
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
});

step("Copio app-server, node e template", () => {
  copyDir(standaloneDir, path.join(dest, "app-server"));
  copyDir(path.join(resourcesDir, "node"), path.join(dest, "node"));
  copyDir(path.join(resourcesDir, "template"), path.join(dest, "template"));
});

step("Scrivo Avvia.bat, LEGGIMI.txt e VERSION.txt", () => {
  const version = new Date().toISOString().replace("T", " ").slice(0, 19);
  fs.writeFileSync(path.join(dest, "VERSION.txt"), `3DPrintSW portabile - build ${version}\r\n`);
  fs.copyFileSync(path.join(root, "scripts", "portable-Avvia.bat"), path.join(dest, "Avvia.bat"));
  fs.copyFileSync(path.join(root, "scripts", "portable-LEGGIMI.txt"), path.join(dest, "LEGGIMI.txt"));
});

process.stdout.write(`\nCartella pronta: ${dest}\n`);
