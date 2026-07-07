import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit legge i propri file .afm dei font a runtime tramite percorsi
  // relativi: va escluso dal bundling per preservare la risoluzione corretta.
  // better-sqlite3 (via l'adapter Prisma) va escluso allo stesso modo: se
  // bundlato da Turbopack, il percorso assoluto del binario nativo .node
  // viene "congelato" nel bundle e punta alla macchina di build, rompendo
  // la portabilità dell'eseguibile standalone su un altro PC.
  serverExternalPackages: ["pdfkit", "better-sqlite3", "@prisma/adapter-better-sqlite3"],
  // Produce .next/standalone: un server autonomo con solo i node_modules
  // necessari, usato per impacchettare l'app come eseguibile Electron.
  output: "standalone",
  // Consente l'accesso in sviluppo (npm run dev) da altri dispositivi sulla
  // stessa rete locale (es. smartphone), altrimenti Next.js blocca per
  // sicurezza le richieste di hot-reload che arrivano da un IP diverso da
  // "localhost". Aggiungi qui l'IP locale del tuo PC se cambia (lo trovi
  // nella riga "Network:" mostrata da "npm run dev").
  allowedDevOrigins: ["192.168.100.4"],
};

export default nextConfig;
