"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Versione portabile (porta 3131): disattiva il service worker per evitare
    // che il browser mostri file JavaScript vecchi dopo un aggiornamento della cartella.
    if (window.location.port === "3131") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Registrazione service worker fallita:", error);
    });
  }, []);

  return null;
}
