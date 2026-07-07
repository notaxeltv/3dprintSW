"use client";

import { FormEvent, useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { formatDateTimeInput } from "@/lib/format";
import Button from "./ui/Button";
import { Input, Label, Select, Textarea } from "./ui/Field";

interface Props {
  products: Product[];
  onSaved: () => void;
  defaultProductId?: string;
}

export default function PrintForm({ products, onSaved, defaultProductId }: Props) {
  const [productId, setProductId] = useState(defaultProductId ?? products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [printedAt, setPrintedAt] = useState(formatDateTimeInput());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selected = products.find((p) => p.id === productId);

  useEffect(() => {
    if (!productId && products.length > 0) {
      setProductId(defaultProductId ?? products[0].id);
    }
  }, [products, productId, defaultProductId]);

  useEffect(() => {
    if (selected) setUnitCost(selected.costPerUnit.toString());
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/prints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: Number(quantity),
          unitCost: unitCost === "" ? undefined : Number(unitCost),
          printedAt: printedAt ? new Date(printedAt).toISOString() : undefined,
          notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.formErrors?.[0] ?? data.error ?? "Errore durante il salvataggio.");
        return;
      }
      setQuantity("1");
      setNotes("");
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Aggiungi prima un modello al catalogo per registrare una stampa.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>}

      <div>
        <Label htmlFor="product">Modello</Label>
        <Select id="product" value={productId} onChange={(e) => setProductId(e.target.value)}>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantità stampata</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="unitCost">Costo unitario (€)</Label>
          <Input
            id="unitCost"
            type="number"
            step="0.01"
            min="0"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="printedAt">Data stampa</Label>
        <Input
          id="printedAt"
          type="date"
          value={printedAt}
          onChange={(e) => setPrintedAt(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="notes">Note</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Es. lotto filamento, colore..." />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Registrazione..." : "Registra stampa"}
      </Button>
    </form>
  );
}
