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

export default function SaleForm({ products, onSaved, defaultProductId }: Props) {
  const [productId, setProductId] = useState(defaultProductId ?? products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [soldAt, setSoldAt] = useState(formatDateTimeInput());
  const [buyer, setBuyer] = useState("");
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
    if (selected) setUnitPrice(selected.price.toString());
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: Number(quantity),
          unitPrice: unitPrice === "" ? undefined : Number(unitPrice),
          soldAt: soldAt ? new Date(soldAt).toISOString() : undefined,
          buyer,
          notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.formErrors?.[0] ?? data.error ?? "Errore durante il salvataggio.");
        return;
      }
      setQuantity("1");
      setBuyer("");
      setNotes("");
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Aggiungi prima un modello al catalogo per registrare una vendita.
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
              {p.name} · disponibili: {p.stats.stock}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantità venduta</Label>
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
          <Label htmlFor="unitPrice">Prezzo unitario (€)</Label>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            min="0"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="soldAt">Data vendita</Label>
          <Input
            id="soldAt"
            type="date"
            value={soldAt}
            onChange={(e) => setSoldAt(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="buyer">Acquirente</Label>
          <Input id="buyer" value={buyer} onChange={(e) => setBuyer(e.target.value)} placeholder="Facoltativo" />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Note</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Es. canale di vendita, spedizione..." />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Registrazione..." : "Registra vendita"}
      </Button>
    </form>
  );
}
