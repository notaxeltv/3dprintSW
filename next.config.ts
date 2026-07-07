import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit legge i propri file .afm dei font a runtime tramite percorsi
  // relativi: va escluso dal bundling per preservare la risoluzione corretta.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
