"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, Building2, Coins, Plus, Trash2 } from "lucide-react";
import { PRICE_DECIMALS, PRICE_STEP } from "@/lib/format";
import { Spool } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import ImageUploadField from "@/components/ImageUploadField";
import ThemeToggle from "@/components/ThemeToggle";

interface SpoolRow {
  id?: string;
  name: string;
  material: string;
  price: string;
  weightGrams: string;
}

function emptySpool(): SpoolRow {
  return { name: "", material: "", price: "", weightGrams: "1000" };
}

export default function ImpostazioniPage() {
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [electricityCostPerHour, setElectricityCostPerHour] = useState("0");
  const [spools, setSpools] = useState<SpoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setCompanyName(data.companyName ?? "");
        setLogoUrl(data.logoUrl ?? "");
        setElectricityCostPerHour(String(data.electricityCostPerHour ?? 0));
        setSpools(
          (data.spools as Spool[] | undefined)?.map((s) => ({
            id: s.id,
            name: s.name,
            material: s.material ?? "",
            price: String(s.price),
            weightGrams: String(s.weightGrams),
          })) ?? []
        );
        setLoading(false);
      })
      .catch(() => {
        setError("Impossibile caricare le impostazioni. Riavvia il server e ricarica la pagina.");
        setLoading(false);
      });
  }, []);

  function updateSpool(index: number, key: keyof SpoolRow, value: string) {
    setSpools((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function addSpool() {
    setSpools((rows) => [...rows, emptySpool()]);
  }

  function removeSpool(index: number) {
    setSpools((rows) => rows.filter((_, i) => i !== index));
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
        body: JSON.stringify({
          companyName,
          logoUrl,
          electricityCostPerHour: Number(electricityCostPerHour || 0),
          spools: spools
            .filter((s) => s.name.trim() !== "")
            .map((s) => ({
              id: s.id,
              name: s.name.trim(),
              material: s.material.trim() || null,
              price: Number(s.price || 0),
              weightGrams: Number(s.weightGrams || 0),
            })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.fieldErrors?.companyName?.[0] ?? "Errore durante il salvataggio.");
        return;
      }
      const data = await res.json();
      setSpools(
        (data.spools as Spool[]).map((s) => ({
          id: s.id,
          name: s.name,
          material: s.material ?? "",
          price: String(s.price),
          weightGrams: String(s.weightGrams),
        }))
      );
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
          Dati azienda, costi di produzione e bobine usati per calcolare automaticamente il costo dei modelli.
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

            <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                <Coins size={16} className="text-indigo-600 dark:text-indigo-400" /> Costi di produzione
              </h2>
              <div>
                <Label htmlFor="electricityCostPerHour">Costo orario corrente (€/h)</Label>
                <Input
                  id="electricityCostPerHour"
                  type="number"
                  step={PRICE_STEP}
                  min="0"
                  value={electricityCostPerHour}
                  onChange={(e) => setElectricityCostPerHour(e.target.value)}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Formula costo: ore × costo orario corrente + grammi × prezzo bobina (€/g).
              </p>
            </div>

            <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
              <div className="mb-3 flex items-center justify-between">
                <Label className="mb-0">Bobine filamento</Label>
                <Button type="button" variant="secondary" size="sm" onClick={addSpool}>
                  <Plus size={14} /> Aggiungi bobina
                </Button>
              </div>

              {spools.length === 0 && (
                <p className="text-xs text-slate-400">
                  Aggiungi le bobine che usi (es. PLA bianco 1 kg). Il costo al grammo viene calcolato automaticamente.
                </p>
              )}

              <div className="space-y-2">
                {spools.map((row, index) => {
                  const price = Number(row.price || 0);
                  const weight = Number(row.weightGrams || 0);
                  const perGram = weight > 0 ? price / weight : 0;
                  return (
                    <div key={row.id ?? `new-${index}`} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-3">
                        {index === 0 && <Label className="text-[11px]">Nome</Label>}
                        <Input
                          value={row.name}
                          onChange={(e) => updateSpool(index, "name", e.target.value)}
                          placeholder="Es. PLA bianco"
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label className="text-[11px]">Materiale</Label>}
                        <Input
                          value={row.material}
                          onChange={(e) => updateSpool(index, "material", e.target.value)}
                          placeholder="PLA"
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label className="text-[11px]">Prezzo (€)</Label>}
                        <Input
                          type="number"
                          step={PRICE_STEP}
                          min="0"
                          value={row.price}
                          onChange={(e) => updateSpool(index, "price", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label className="text-[11px]">Peso (g)</Label>}
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          value={row.weightGrams}
                          onChange={(e) => updateSpool(index, "weightGrams", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label className="text-[11px]">€/g</Label>}
                        <p className="h-9 flex items-center text-xs text-slate-500 dark:text-slate-400">
                          {perGram.toFixed(PRICE_DECIMALS).replace(/\.?0+$/, "")}
                        </p>
                      </div>
                      <div className="col-span-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeSpool(index)}>
                          <Trash2 size={14} className="text-rose-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
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
