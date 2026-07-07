/**
 * Prepara le risorse necessarie per impacchettare l'app come eseguibile Electron:
 * - copia .next/static e public/ dentro .next/standalone (richiesto da Next.js output standalone)
 * - copia l'eseguibile node.exe corrente (stessa ABI usata per compilare better-sqlite3)
 * - genera un database SQLite "template" con lo schema già migrato ma senza dati
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const standaloneDir = path.join(root, ".next", "standalone");
const resourcesDir = path.join(root, "electron", "resources");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function step(label, fn) {
  process.stdout.write(`\n> ${label}...\n`);
  fn();
}

step("Verifico output standalone Next.js", () => {
  if (!fs.existsSync(standaloneDir)) {
    throw new Error(
      ".next/standalone non trovato. Esegui prima 'npm run build' (con output: 'standalone' in next.config.ts)."
    );
  }
});

step("Copio .next/static -> .next/standalone/.next/static", () => {
  copyDir(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"));
});

step("Copio public/ -> .next/standalone/public", () => {
  copyDir(path.join(root, "public"), path.join(standaloneDir, "public"));
});

step("Copio node.exe (stessa versione usata per compilare i moduli nativi)", () => {
  const nodeExe = process.execPath;
  const destDir = path.join(resourcesDir, "node");
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(nodeExe, path.join(destDir, "node.exe"));
});

step("Genero il database SQLite template (schema migrato, nessun dato)", () => {
  const templateDir = path.join(resourcesDir, "template");
  fs.mkdirSync(templateDir, { recursive: true });
  const templateDbPath = path.join(templateDir, "app-template.db");

  fs.rmSync(templateDbPath, { force: true });

  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, DATABASE_URL: `file:${templateDbPath}` },
  });
});

process.stdout.write("\nRisorse Electron pronte in electron/resources e .next/standalone.\n");
