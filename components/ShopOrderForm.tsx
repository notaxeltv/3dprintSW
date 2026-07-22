"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ShopCatalogItem } from "@/lib/shop";
import { formatCurrency } from "@/lib/format";
import Button from "./ui/Button";
import { Input, Label, Select, Textarea } from "./ui/Field";

interface CartLine {
  key: string;
  productId: string;
  variantId: string | null;
  label: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  products: ShopCatalogItem[];
  onSaved: () => void;
}

export default function ShopOrderForm({ products, onSaved }: Props) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selected = products.find((p) => p.id === productId);
  const hasVariants = (selected?.variants.length ?? 0) > 0;

  useEffect(() => {
    if (!productId && products.length > 0) setProductId(products[0].id);
  }, [products, productId]);

  useEffect(() => {
    if (!selected) return;
    if (hasVariants) {
      setVariantId(selected.variants[0]?.id ?? "");
    } else {
      setVariantId("");
    }
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  function currentUnitPrice() {
    if (!selected) return 0;
    if (hasVariants) {
      return selected.variants.find((v) => v.id === variantId)?.wholesalePrice ?? 0;
    }
    return selected.wholesalePrice;
  }

  function currentLabel() {
    if (!selected) return "";
    if (hasVariants) {
      const v = selected.variants.find((x) => x.id === variantId);
      return v
        ? `${selected.name} · ${v.label ? `${v.label} · ` : ""}${v.height}×${v.width}×${v.depth} cm`
        : selected.name;
    }
    return selected.name;
  }

  function addToCart() {
    if (!selected) return;
    const qty = Number(quantity);
    if (!qty || qty < 1) return;

    const vid = hasVariants ? variantId : null;
    const key = `${selected.id}:${vid ?? "base"}`;
    const unitPrice = currentUnitPrice();
    const label = currentLabel();

    setCart((lines) => {
      const existing = lines.find((l) => l.key === key);
      if (existing) {
        return lines.map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + qty } : l
        );
      }
      return [
        ...lines,
        {
          key,
          productId: selected.id,
          variantId: vid,
          label,
          quantity: qty,
          unitPrice,
        },
      ];
    });
    setQuantity("1");
  }

  function removeLine(key: string) {
    setCart((lines) => lines.filter((l) => l.key !== key));
  }

  const cartTotal = cart.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Aggiungi almeno un articolo all'ordine.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          items: cart.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(
          typeof data.error === "string"
            ? data.error
            : data.error?.fieldErrors?.items?.[0] ?? "Errore durante l'invio."
        );
        return;
      }

      setCart([]);
      setNotes("");
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Il catalogo del fornitore non contiene ancora articoli ordinabili.
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
        <Label htmlFor="order-product">Modello</Label>
        <Select id="order-product" value={productId} onChange={(e) => setProductId(e.target.value)}>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      {hasVariants && selected && (
        <div>
          <Label htmlFor="order-variant">Misura</Label>
          <Select id="order-variant" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
            {selected.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label ? `${v.label} · ` : ""}
                {v.height}×{v.width}×{v.depth} cm · {formatCurrency(v.wholesalePrice)}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="order-qty">Quantità</Label>
          <Input
            id="order-qty"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button type="button" variant="secondary" className="w-full" onClick={addToCart}>
            <Plus size={16} /> Aggiungi
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Prezzo fornitore: <strong>{formatCurrency(currentUnitPrice())}</strong>
      </p>

      {cart.length > 0 && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {cart.map((line) => (
              <li key={line.key} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{line.label}</p>
                  <p className="text-xs text-slate-500">
                    {line.quantity} × {formatCurrency(line.unitPrice)} ={" "}
                    {formatCurrency(line.quantity * line.unitPrice)}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(line.key)}>
                  <Trash2 size={14} className="text-rose-500" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 px-3 py-2 text-sm font-semibold dark:border-slate-800">
            Totale ordine: {formatCurrency(cartTotal)}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="order-notes">Note per il fornitore</Label>
        <Textarea
          id="order-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Es. urgenza, consegna, varianti colore..."
        />
      </div>

      <Button type="submit" disabled={submitting || cart.length === 0} className="w-full">
        {submitting ? "Invio..." : "Invia ordine al fornitore"}
      </Button>
    </form>
  );
}
