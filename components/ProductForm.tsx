"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Ruler } from "lucide-react";
import { Product, Settings, Spool, LabelOption, Keychain } from "@/lib/types";
import { calculateProductCost, formatEuro, formatPriceValue } from "@/lib/cost";
import { PRICE_STEP } from "@/lib/format";
import Button from "./ui/Button";
import { Input, Label, Textarea, FieldError } from "./ui/Field";
import ImageUploadField from "./ImageUploadField";

interface Props {
  product?: Product | null;
  onSaved: () => void;
  onCancel: () => void;
}

interface VariantRow {
  label: string;
  height: string;
  width: string;
  depth: string;
  price: string;
}

function emptyVariant(): VariantRow {
  return { label: "", height: "", width: "", depth: "", price: "" };
}

const selectClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

export default function ProductForm({ product, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "",
    subcategory: product?.subcategory ?? "",
    imageUrl: product?.imageUrl ?? "",
    material: product?.material ?? "",
    printHours: product?.printHours?.toString() ?? "",
    weightGrams: product?.weightGrams?.toString() ?? "",
    spoolId: product?.spoolId ?? "",
    labelOptionId: product?.labelOptionId ?? "",
    keychainId: product?.keychainId ?? "",
    costPerUnit: product?.costPerUnit?.toString() ?? "0",
    price: product?.price?.toString() ?? "0",
    minStock: product?.minStock?.toString() ?? "0",
  });
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants?.length
      ? product.variants.map((v) => ({
          label: v.label ?? "",
          height: v.height.toString(),
          width: v.width.toString(),
          depth: v.depth.toString(),
          price: v.price.toString(),
        }))
      : []
  );
  const [spools, setSpools] = useState<Spool[]>([]);
  const [labelOptions, setLabelOptions] = useState<LabelOption[]>([]);
  const [keychains, setKeychains] = useState<Keychain[]>([]);
  const [electricityCostPerHour, setElectricityCostPerHour] = useState(0);
  const [costManual, setCostManual] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Settings) => {
        setSpools(data.spools ?? []);
        setLabelOptions(data.labelOptions ?? []);
        setKeychains(data.keychains ?? []);
        setElectricityCostPerHour(data.electricityCostPerHour ?? 0);
      });
  }, []);

  const selectedSpool = useMemo(
    () => spools.find((s) => s.id === form.spoolId) ?? null,
    [spools, form.spoolId]
  );

  const selectedLabel = useMemo(
    () => labelOptions.find((l) => l.id === form.labelOptionId) ?? null,
    [labelOptions, form.labelOptionId]
  );

  const selectedKeychain = useMemo(
    () => keychains.find((k) => k.id === form.keychainId) ?? null,
    [keychains, form.keychainId]
  );

  const costBreakdown = useMemo(() => {
    const printHours = Number(form.printHours || 0);
    const weightGrams = Number(form.weightGrams || 0);
    return calculateProductCost({
      printHours,
      weightGrams: selectedSpool ? weightGrams : 0,
      electricityCostPerHour,
      spoolPrice: selectedSpool?.price ?? 0,
      spoolWeightGrams: selectedSpool?.weightGrams ?? 0,
      labelPrice: selectedLabel ? selectedLabel.price : undefined,
      keychainPrice: selectedKeychain ? selectedKeychain.price : undefined,
    });
  }, [
    form.printHours,
    form.weightGrams,
    selectedSpool,
    selectedLabel,
    selectedKeychain,
    electricityCostPerHour,
  ]);

  useEffect(() => {
    if (costManual) return;
    setForm((f) => ({ ...f, costPerUnit: formatPriceValue(costBreakdown.total) }));
  }, [costBreakdown.total, costManual]);

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSpoolChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const spoolId = e.target.value;
    const spool = spools.find((s) => s.id === spoolId);
    setForm((f) => ({
      ...f,
      spoolId,
      material: spool?.material || f.material,
    }));
  }

  function updateVariant(index: number, key: keyof VariantRow, value: string) {
    setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function addVariant() {
    setVariants((rows) => [...rows, emptyVariant()]);
  }

  function removeVariant(index: number) {
    setVariants((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    const validVariants = variants
      .filter((v) => v.height !== "" || v.width !== "" || v.depth !== "" || v.price !== "")
      .map((v) => ({
        label: v.label || null,
        height: Number(v.height || 0),
        width: Number(v.width || 0),
        depth: Number(v.depth || 0),
        price: Number(v.price || 0),
      }));

    const payload = {
      ...form,
      printHours: form.printHours === "" ? null : Number(form.printHours),
      weightGrams: form.weightGrams === "" ? null : Number(form.weightGrams),
      spoolId: form.spoolId || null,
      labelOptionId: form.labelOptionId || null,
      keychainId: form.keychainId || null,
      costPerUnit: Number(form.costPerUnit),
      price: Number(form.price),
      minStock: Number(form.minStock),
      variants: validVariants,
    };

    try {
      const res = await fetch(
        product ? `/api/products/${product.id}` : "/api/products",
        {
          method: product ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.fieldErrors) {
          setErrors(data.error.fieldErrors);
        } else {
          setFormError(data.error ?? "Si è verificato un errore.");
        }
        return;
      }

      onSaved();
    } catch {
      setFormError("Impossibile contattare il server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {formError}
        </div>
      )}

      <div>
        <Label htmlFor="name">Nome modello *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={update("name")}
          placeholder="Es. Vaso geometrico"
          required
        />
        <FieldError>{errors.name?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="description">Descrizione</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={update("description")}
          placeholder="Dettagli, note..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            value={form.category}
            onChange={update("category")}
            placeholder="Es. Decorazione"
          />
        </div>
        <div>
          <Label htmlFor="subcategory">Sottocategoria</Label>
          <Input
            id="subcategory"
            value={form.subcategory}
            onChange={update("subcategory")}
            placeholder="Es. Vasi"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="spoolId">Bobina filamento</Label>
          <select
            id="spoolId"
            value={form.spoolId}
            onChange={handleSpoolChange}
            className={selectClassName}
          >
            <option value="">Seleziona bobina...</option>
            {spools.map((spool) => (
              <option key={spool.id} value={spool.id}>
                {spool.name}
                {spool.material ? ` (${spool.material})` : ""}
              </option>
            ))}
          </select>
          {spools.length === 0 && (
            <p className="mt-1 text-xs text-slate-400">
              Nessuna bobina configurata. Aggiungile in Impostazioni.
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="material">Materiale</Label>
          <Input
            id="material"
            value={form.material}
            onChange={update("material")}
            placeholder="Es. PLA, PETG..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="labelOptionId">Etichetta (facoltativo)</Label>
          <select
            id="labelOptionId"
            value={form.labelOptionId}
            onChange={update("labelOptionId")}
            className={selectClassName}
          >
            <option value="">Nessuna — non aggiunge costo</option>
            {labelOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {labelOptions.length === 0 && (
            <p className="mt-1 text-xs text-slate-400">
              Nessuna etichetta configurata. Aggiungile in Impostazioni.
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="keychainId">Portachiavi (facoltativo)</Label>
          <select
            id="keychainId"
            value={form.keychainId}
            onChange={update("keychainId")}
            className={selectClassName}
          >
            <option value="">Nessuno — non aggiunge costo</option>
            {keychains.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {keychains.length === 0 && (
            <p className="mt-1 text-xs text-slate-400">
              Nessun portachiavi configurato. Aggiungili in Impostazioni.
            </p>
          )}
        </div>
      </div>

      <ImageUploadField
        label="Foto del modello"
        value={form.imageUrl}
        onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
      />

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="printHours">Ore di stampa</Label>
          <Input
            id="printHours"
            type="number"
            step="0.1"
            min="0"
            value={form.printHours}
            onChange={update("printHours")}
          />
        </div>
        <div>
          <Label htmlFor="weightGrams">Peso (g)</Label>
          <Input
            id="weightGrams"
            type="number"
            step="1"
            min="0"
            value={form.weightGrams}
            onChange={update("weightGrams")}
            placeholder="Es. 45"
          />
        </div>
        <div>
          <Label htmlFor="minStock">Scorta minima</Label>
          <Input
            id="minStock"
            type="number"
            min="0"
            value={form.minStock}
            onChange={update("minStock")}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
        <div className="mb-2 flex items-center justify-between">
          <Label className="mb-0">Calcolo costo automatico</Label>
          <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={costManual}
              onChange={(e) => setCostManual(e.target.checked)}
              className="rounded border-slate-300"
            />
            Inserimento manuale
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div>
            <span className="text-slate-400">Ore × costo orario corrente</span>
            <p className="font-medium">{formatEuro(costBreakdown.electricityCost)}</p>
          </div>
          <div>
            <span className="text-slate-400">Grammi × prezzo bobina</span>
            <p className="font-medium">{formatEuro(costBreakdown.filamentCost)}</p>
          </div>
          {form.labelOptionId && (
            <div>
              <span className="text-slate-400">Etichetta selezionata</span>
              <p className="font-medium">{formatEuro(costBreakdown.labelCost)}</p>
            </div>
          )}
          {form.keychainId && (
            <div>
              <span className="text-slate-400">Portachiavi selezionato</span>
              <p className="font-medium">{formatEuro(costBreakdown.keychainCost)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="costPerUnit">Costo unitario (€) *</Label>
          <Input
            id="costPerUnit"
            type="number"
            step={PRICE_STEP}
            min="0"
            value={form.costPerUnit}
            onChange={(e) => {
              setCostManual(true);
              update("costPerUnit")(e);
            }}
            readOnly={!costManual}
            required
          />
          <FieldError>{errors.costPerUnit?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor="price">Prezzo di vendita (€) *</Label>
          <Input
            id="price"
            type="number"
            step={PRICE_STEP}
            min="0"
            value={form.price}
            onChange={update("price")}
            required
          />
          <FieldError>{errors.price?.[0]}</FieldError>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
        <div className="mb-3 flex items-center justify-between">
          <Label className="mb-0 flex items-center gap-1.5">
            <Ruler size={14} /> Misure e prezzi disponibili
          </Label>
          <Button type="button" variant="secondary" size="sm" onClick={addVariant}>
            <Plus size={14} /> Aggiungi misura
          </Button>
        </div>

        {variants.length === 0 && (
          <p className="text-xs text-slate-400">
            Facoltativo: aggiungi una o più combinazioni altezza × larghezza × profondità con il
            relativo prezzo. Verranno mostrate nel catalogo e nel PDF esportato.
          </p>
        )}

        <div className="space-y-2">
          {variants.map((row, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-3">
                {index === 0 && <Label className="text-[11px]">Etichetta</Label>}
                <Input
                  value={row.label}
                  onChange={(e) => updateVariant(index, "label", e.target.value)}
                  placeholder="Es. S"
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <Label className="text-[11px]">Alt. (cm)</Label>}
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={row.height}
                  onChange={(e) => updateVariant(index, "height", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <Label className="text-[11px]">Larg. (cm)</Label>}
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={row.width}
                  onChange={(e) => updateVariant(index, "width", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <Label className="text-[11px]">Prof. (cm)</Label>}
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={row.depth}
                  onChange={(e) => updateVariant(index, "depth", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <Label className="text-[11px]">Prezzo (€)</Label>}
                <Input
                  type="number"
                  step={PRICE_STEP}
                  min="0"
                  value={row.price}
                  onChange={(e) => updateVariant(index, "price", e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)}>
                  <Trash2 size={14} className="text-rose-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvataggio..." : product ? "Salva modifiche" : "Crea modello"}
        </Button>
      </div>
    </form>
  );
}
