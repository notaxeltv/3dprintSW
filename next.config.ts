import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit legge i propri file .afm dei font a runtime tramite percorsi
  // relativi: va escluso dal bundling per preservare la risoluzione corretta.
  serverExternalPackages: ["pdfkit"],
  // Consente l'accesso in sviluppo (npm run dev) da altri dispositivi sulla
  // stessa rete locale (es. smartphone), altrimenti Next.js blocca per
  // sicurezza le richieste di hot-reload che arrivano da un IP diverso da
  // "localhost". Aggiungi qui l'IP locale del tuo PC se cambia (lo trovi
  // nella riga "Network:" mostrata da "npm run dev").
  allowedDevOrigins: ["192.168.100.4"],
};

export default nextConfig;
