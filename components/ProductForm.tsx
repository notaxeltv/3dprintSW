"use client";

import { FormEvent, useState } from "react";
import { Product } from "@/lib/types";
import Button from "./ui/Button";
import { Input, Label, Textarea, FieldError } from "./ui/Field";

interface Props {
  product?: Product | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "",
    imageUrl: product?.imageUrl ?? "",
    material: product?.material ?? "",
    printHours: product?.printHours?.toString() ?? "",
    costPerUnit: product?.costPerUnit?.toString() ?? "0",
    price: product?.price?.toString() ?? "0",
    minStock: product?.minStock?.toString() ?? "0",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    const payload = {
      ...form,
      printHours: form.printHours === "" ? null : Number(form.printHours),
      costPerUnit: Number(form.costPerUnit),
      price: Number(form.price),
      minStock: Number(form.minStock),
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
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>
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
          placeholder="Dettagli, dimensioni, note..."
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
          <Label htmlFor="material">Materiale</Label>
          <Input
            id="material"
            value={form.material}
            onChange={update("material")}
            placeholder="Es. PLA, PETG..."
          />
        </div>
      </div>

      <div>
        <Label htmlFor="imageUrl">URL immagine</Label>
        <Input
          id="imageUrl"
          value={form.imageUrl}
          onChange={update("imageUrl")}
          placeholder="https://..."
        />
      </div>

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
          <Label htmlFor="price">Prezzo di vendita (€) *</Label>
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
