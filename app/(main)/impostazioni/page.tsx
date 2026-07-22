"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, Building2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import ImageUploadField from "@/components/ImageUploadField";
import ThemeToggle from "@/components/ThemeToggle";

export default function ImpostazioniPage() {
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setCompanyName(data.companyName ?? "");
        setLogoUrl(data.logoUrl ?? "");
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, logoUrl }),
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
          Dati dell&apos;azienda usati nella copertina del catalogo esportato in PDF e preferenze dell&apos;app.
        </p>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <Building2 size={16} className="text-indigo-600 dark:text-indigo-400" /> Azienda
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Caricamento...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
