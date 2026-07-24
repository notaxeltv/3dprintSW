"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, Building2, Share2, BadgePercent } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import ImageUploadField from "@/components/ImageUploadField";
import ThemeToggle from "@/components/ThemeToggle";
import {
  SOCIAL_NETWORKS,
  emptySocialLinks,
  socialLinksFromSettings,
  type SocialLinkKey,
} from "@/lib/social";
import type { Settings } from "@/lib/types";
import { PRICING_MODES, type PricingMode } from "@/lib/pricing";

export default function ImpostazioniPage() {
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [socialLinks, setSocialLinks] = useState(emptySocialLinks());
  const [pricingMode, setPricingMode] = useState<PricingMode>("MARKUP");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Settings) => {
        setCompanyName(data.companyName ?? "");
        setLogoUrl(data.logoUrl ?? "");
        setSocialLinks(socialLinksFromSettings(data));
        setPricingMode(data.pricingMode === "FIXED" ? "FIXED" : "MARKUP");
        setLoading(false);
      });
  }, []);

  function updateSocialLink(key: SocialLinkKey, value: string) {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, logoUrl, pricingMode, ...socialLinks }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.fieldErrors?.companyName?.[0] ?? "Errore durante il salvataggio.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Impostazioni</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Dati dell&apos;azienda usati nella copertina del catalogo esportato in PDF, link social e
          preferenze dell&apos;app.
        </p>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <Building2 size={16} className="text-indigo-600 dark:text-indigo-400" /> Azienda
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Caricamento...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </div>
            )}
            {saved && (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Impostazioni salvate.
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Nome azienda *</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Es. La mia azienda 3D"
                  required
                />
              </div>

              <ImageUploadField label="Logo azienda" value={logoUrl} onChange={setLogoUrl} />
            </div>

            <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                <BadgePercent size={16} className="text-indigo-600 dark:text-indigo-400" /> Politica prezzi
              </h2>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                Scegli se lasciare ai negozi un ricarico libero o imporre un prezzo al pubblico uguale per tutti (modello Apple).
              </p>
              <div className="space-y-3">
                {PRICING_MODES.map((mode) => (
                  <label
                    key={mode.value}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                      pricingMode === mode.value
                        ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-500/10"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pricingMode"
                      value={mode.value}
                      checked={pricingMode === mode.value}
                      onChange={() => setPricingMode(mode.value)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {mode.label}
                      </span>
                      <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                        {mode.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {pricingMode === "FIXED" && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  In modalità prezzo fisso, imposta il <strong>Prezzo al pubblico</strong> su ogni articolo nel catalogo admin.
                  Vetrina e negozi mostreranno lo stesso importo; il margine del negozio sarà automatico (prezzo fisso − prezzo acquisto).
                </p>
              )}
            </div>

            <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                <Share2 size={16} className="text-indigo-600 dark:text-indigo-400" /> Link social
              </h2>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                Compila solo i canali che usi. I campi vuoti non vengono mostrati sotto il login.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {SOCIAL_NETWORKS.map(({ key, label, placeholder, hint }) => (
                  <div key={key} className={key === "websiteUrl" || key === "email" ? "sm:col-span-2" : ""}>
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      value={socialLinks[key]}
                      onChange={(e) => updateSocialLink(key, e.target.value)}
                      placeholder={placeholder}
                    />
                    {hint && (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving}>
                <Save size={16} /> {saving ? "Salvataggio..." : "Salva"}
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card className="p-5 md:hidden">
        <h2 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Aspetto</h2>
        <ThemeToggle />
      </Card>
    </div>
  );
}
