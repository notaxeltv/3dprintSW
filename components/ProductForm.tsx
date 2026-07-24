"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2, Ruler } from "lucide-react";
import { Product } from "@/lib/types";
import Button from "./ui/Button";
import { Input, Label, Textarea, FieldError } from "./ui/Field";
import ImageUploadField from "./ImageUploadField";
import ProductGalleryField, { type GalleryImageInput } from "./ProductGalleryField";
import type { PricingMode } from "@/lib/pricing";

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
  publicPrice: string;
}

function emptyVariant(): VariantRow {
  return { label: "", height: "", width: "", depth: "", price: "", publicPrice: "" };
}

export default function ProductForm({ product, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "",
    subcategory: product?.subcategory ?? "",
    imageUrl: product?.imageUrl ?? "",
    material: product?.material ?? "",
    printHours: product?.printHours?.toString() ?? "",
    costPerUnit: product?.costPerUnit?.toString() ?? "0",
    price: product?.price?.toString() ?? "0",
    publicPrice: product?.publicPrice?.toString() ?? "",
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
          publicPrice: v.publicPrice?.toString() ?? "",
        }))
      : []
  );
  const [gallery, setGallery] = useState<GalleryImageInput[]>(
    product?.images?.length
      ? product.images.map((image) => ({
          url: image.url,
          caption: image.caption ?? "",
        }))
      : []
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pricingMode, setPricingMode] = useState<PricingMode>("MARKUP");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPricingMode(data?.pricingMode === "FIXED" ? "FIXED" : "MARKUP"))
      .catch(() => setPricingMode("MARKUP"));
  }, []);

  const isFixedPricing = pricingMode === "FIXED";

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

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
        publicPrice: v.publicPrice === "" ? null : Number(v.publicPrice),
      }));

    const galleryPayload = gallery
      .filter((image) => image.url.trim() !== "")
      .map((image) => ({
        url: image.url.trim(),
        caption: image.caption.trim() || null,
      }));

    const payload = {
      ...form,
      printHours: form.printHours === "" ? null : Number(form.printHours),
      costPerUnit: Number(form.costPerUnit),
      price: Number(form.price),
      publicPrice: form.publicPrice === "" ? null : Number(form.publicPrice),
      minStock: Number(form.minStock),
      variants: validVariants,
      images: galleryPayload,
      imageUrl: form.imageUrl || galleryPayload[0]?.url || "",
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

      <div>
        <Label htmlFor="material">Materiale</Label>
        <Input
          id="material"
          value={form.material}
          onChange={update("material")}
          placeholder="Es. PLA, PETG..."
        />
      </div>

      <ImageUploadField
        label="Foto del modello"
        value={form.imageUrl}
        onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
      />

      <ProductGalleryField value={gallery} onChange={setGallery} />

      <div className="grid grid-cols-2 gap-4">
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

      <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
        <strong>Prezzo al negozio</strong>: quanto pagano i negozi partner (ordini e area negozio).
        <br />
        {isFixedPricing ? (
          <>
            <strong>Prezzo al pubblico</strong>: prezzo fisso imposto da te (vetrina + tutti i negozi, stile Apple).
            Il margine del negozio è calcolato automaticamente.
          </>
        ) : (
          <>
            <strong>Prezzo vetrina</strong>: quanto mostri sul sito pubblico. I negozi applicano il proprio ricarico
            ai clienti finali.
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="costPerUnit">Costo unitario (€) *</Label>
          <Input
            id="costPerUnit"
            type="number"
            step="0.01"
            min="0"
            value={form.costPerUnit}
            onChange={update("costPerUnit")}
            required
          />
          <FieldError>{errors.costPerUnit?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor="price">Prezzo al negozio (€) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={update("price")}
            required
          />
          <FieldError>{errors.price?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor="publicPrice">
            {isFixedPricing ? "Prezzo al pubblico (fisso) *" : "Prezzo vetrina (€)"}
          </Label>
          <Input
            id="publicPrice"
            type="number"
            step="0.01"
            min="0"
            value={form.publicPrice}
            onChange={update("publicPrice")}
            placeholder={isFixedPricing ? "Es. 24,90" : "Es. 24,90"}
            required={isFixedPricing}
          />
          <p className="mt-1 text-xs text-slate-400">
            {isFixedPricing
              ? "Obbligatorio in modalità prezzo fisso: stesso prezzo in vetrina e per tutti i negozi."
              : "Facoltativo. Se vuoto: «Prezzo su richiesta» in vetrina."}
          </p>
          <FieldError>{errors.publicPrice?.[0]}</FieldError>
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
            Facoltativo: aggiungi misure con prezzo negozio e
            {isFixedPricing ? " prezzo al pubblico per misura." : " prezzo vetrina, se diverso."}
          </p>
        )}

        <div className="space-y-2">
          {variants.map((row, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-12 sm:col-span-2">
                {index === 0 && <Label className="text-[11px]">Etichetta</Label>}
                <Input
                  value={row.label}
                  onChange={(e) => updateVariant(index, "label", e.target.value)}
                  placeholder="Es. S"
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                {index === 0 && <Label className="text-[11px]">Alt. (cm)</Label>}
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={row.height}
                  onChange={(e) => updateVariant(index, "height", e.target.value)}
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                {index === 0 && <Label className="text-[11px]">Larg. (cm)</Label>}
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={row.width}
                  onChange={(e) => updateVariant(index, "width", e.target.value)}
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                {index === 0 && <Label className="text-[11px]">Prof. (cm)</Label>}
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={row.depth}
                  onChange={(e) => updateVariant(index, "depth", e.target.value)}
                />
              </div>
              <div className="col-span-6 sm:col-span-2">
                {index === 0 && <Label className="text-[11px]">Prezzo negozio (€)</Label>}
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.price}
                  onChange={(e) => updateVariant(index, "price", e.target.value)}
                />
              </div>
              <div className="col-span-5 sm:col-span-1">
                {index === 0 && (
                  <Label className="text-[11px]">
                    {isFixedPricing ? "Pubblico (€)" : "Vetrina (€)"}
                  </Label>
                )}
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.publicPrice}
                  onChange={(e) => updateVariant(index, "publicPrice", e.target.value)}
                  placeholder="—"
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
