"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "3dprintsw-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVisible(localStorage.getItem(CONSENT_KEY) !== "accepted");
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Usiamo cookie tecnici necessari al funzionamento del sito. Continuando la navigazione accetti
          la nostra{" "}
          <Link href="/cookie" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Cookie Policy
          </Link>{" "}
          e la{" "}
          <Link href="/privacy" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Accetta
        </button>
      </div>
    </div>
  );
}
