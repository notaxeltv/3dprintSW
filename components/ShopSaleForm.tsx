"use client";

import { FormEvent, useEffect, useState } from "react";
import type { ShopCatalogItem } from "@/lib/shop";
import { formatDateTimeInput } from "@/lib/format";
import Button from "./ui/Button";
import { Input, Label, Select, Textarea } from "./ui/Field";

interface Props {
  products: ShopCatalogItem[];
  onSaved: () => void;
}

export default function ShopSaleForm({ products, onSaved }: Props) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitRetailPrice, setUnitRetailPrice] = useState("");
  const [soldAt, setSoldAt] = useState(formatDateTimeInput());
  const [buyer, setBuyer] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selected = products.find((p) => p.id === productId);
  const hasVariants = (selected?.variants.length ?? 0) > 0;

  useEffect(() => {
    if (!productId && products.length > 0) {
      setProductId(products[0].id);
    }
  }, [products, productId]);

  useEffect(() => {
    if (!selected) return;
    if (hasVariants) {
      const firstVariant = selected.variants[0];
      setVariantId(firstVariant?.id ?? "");
      setUnitRetailPrice(firstVariant?.retailPrice.toString() ?? "");
    } else {
      setVariantId("");
      setUnitRetailPrice(selected.retailPrice.toString());
    }
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selected || !hasVariants || !variantId) return;
    const variant = selected.variants.find((v) => v.id === variantId);
    if (variant) setUnitRetailPrice(variant.retailPrice.toString());
  }, [variantId, selected, hasVariants]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/shop/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          variantId: hasVariants ? variantId : null,
          quantity: Number(quantity),
          unitRetailPrice: unitRetailPrice === "" ? undefined : Number(unitRetailPrice),
          soldAt: soldAt ? new Date(soldAt).toISOString() : undefined,
          buyer,
          notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(
          typeof data.error === "string"
            ? data.error
            : data.error?.fieldErrors?.productId?.[0] ?? "Errore durante il salvataggio."
        );
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
        Il catalogo del fornitore non contiene ancora articoli.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

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

      {hasVariants && selected && (
        <div>
          <Label htmlFor="variant">Misura</Label>
          <Select id="variant" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
            {selected.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label ? `${v.label} · ` : ""}
                {v.height}×{v.width}×{v.depth} cm · {v.retailPrice.toFixed(2)} €
              </option>
            ))}
          </Select>
        </div>
      )}

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
          <Label htmlFor="unitRetailPrice">Prezzo al cliente (€)</Label>
          <Input
            id="unitRetailPrice"
            type="number"
            step="0.01"
            min="0"
            value={unitRetailPrice}
            onChange={(e) => setUnitRetailPrice(e.target.value)}
          />
        </div>
      </div>

      {selected && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Prezzo acquisto dal fornitore:{" "}
          {hasVariants
            ? formatWholesale(selected, variantId)
            : `${selected.wholesalePrice.toFixed(2)} €`}
        </p>
      )}

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
          <Label htmlFor="buyer">Cliente</Label>
          <Input
            id="buyer"
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            placeholder="Facoltativo"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Note</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Facoltativo"
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Registrazione..." : "Registra vendita"}
      </Button>
    </form>
  );
}

function formatWholesale(product: ShopCatalogItem, variantId: string) {
  const variant = product.variants.find((v) => v.id === variantId);
  return variant ? `${variant.wholesalePrice.toFixed(2)} €` : "—";
}
