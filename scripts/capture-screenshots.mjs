/**
 * Cattura screenshot di tutte le pagine vetrina e Dashboard.
 * Uso: node scripts/capture-screenshots.mjs
 * Richiede: dev server su http://localhost:3000
 */
import { mkdir, cp } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3000";
const OUT = path.resolve("docs/screenshots");
const ARTIFACTS = "/opt/cursor/artifacts/screenshots";
const VIEWPORT = { width: 1440, height: 900 };

async function waitForPage(page, selector = "main, h1, form", timeout = 15000) {
  await page.waitForLoadState("networkidle", { timeout }).catch(() => {});
  await page.waitForSelector(selector, { timeout }).catch(() => {});
  await page.waitForTimeout(600);
}


async function login(page, username, password) {
  const res = await page.request.post(`${BASE}/api/auth/login`, {
    data: { username, password },
  });
  if (!res.ok()) {
    throw new Error(`Login fallito per ${username}: ${res.status()}`);
  }
  const data = await res.json();
  const target = data.user.role === "SHOP" ? "/negozio" : "/";
  await page.goto(`${BASE}${target}`);
  await waitForPage(page);
}

async function logout(page) {
  await page.evaluate(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
  });
  await page.context().clearCookies();
}

async function shot(page, file, url) {
  await page.goto(`${BASE}${url}`);
  await waitForPage(page);
  const filePath = path.join(OUT, file);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`✓ ${file}`);
  return filePath;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(ARTIFACTS, { recursive: true }).catch(() => {});

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    locale: "it-IT",
  });
  await context.addInitScript(() => {
    localStorage.setItem("3dprintsw-cookie-consent", "accepted");
  });
  const page = await context.newPage();

  let productId = null;
  try {
    const res = await fetch(`${BASE}/api/catalog/public`);
    if (res.ok) {
      const products = await res.json();
      productId = products[0]?.id ?? null;
    }
  } catch {
    console.warn("Impossibile leggere catalogo pubblico; screenshot prodotto saltato se manca id.");
  }

  const shots = [];

  // --- Vetrina (route /vetrina/* su localhost) ---
  shots.push(await shot(page, "01-vetrina-home.png", "/vetrina"));
  shots.push(await shot(page, "02-vetrina-catalogo.png", "/vetrina/catalogo"));
  if (productId) {
    shots.push(await shot(page, "03-vetrina-prodotto.png", `/vetrina/catalogo/${productId}`));
  }
  shots.push(await shot(page, "04-vetrina-privacy.png", "/vetrina/privacy"));
  shots.push(await shot(page, "05-vetrina-cookie.png", "/vetrina/cookie"));

  // --- Login ---
  await page.goto(`${BASE}/login`);
  await waitForPage(page, "form");
  await page.screenshot({ path: path.join(OUT, "06-login.png"), fullPage: true });
  console.log("✓ 06-login.png");
  shots.push(path.join(OUT, "06-login.png"));

  // --- Dashboard Admin ---
  await login(page, "admin", "admin123");

  const adminPages = [
    ["07-dashboard-home.png", "/"],
    ["08-dashboard-catalogo.png", "/catalogo"],
    ["10-dashboard-stampe.png", "/stampe"],
    ["11-dashboard-vendite.png", "/vendite"],
    ["12-dashboard-ordini-negozi.png", "/ordini-negozi"],
    ["13-dashboard-negozi.png", "/negozi"],
    ["14-dashboard-impostazioni.png", "/impostazioni"],
  ];

  for (const [file, url] of adminPages) {
    shots.push(await shot(page, file, url));
  }

  if (productId) {
    shots.push(await shot(page, "09-dashboard-prodotto.png", `/catalogo/${productId}`));
  }

  await logout(page);

  // --- Area Negozio ---
  await login(page, "negozio_demo", "negozio123");

  const shopPages = [
    ["15-negozio-home.png", "/negozio"],
    ["16-negozio-catalogo.png", "/negozio/catalogo"],
    ["17-negozio-vendite.png", "/negozio/vendite"],
    ["18-negozio-ordini.png", "/negozio/ordini"],
  ];

  for (const [file, url] of shopPages) {
    shots.push(await shot(page, file, url));
  }

  await browser.close();

  for (const src of shots) {
    const dest = path.join(ARTIFACTS, path.basename(src));
    await cp(src, dest).catch(() => {});
  }

  console.log(`\n${shots.length} screenshot salvati in docs/screenshots/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
