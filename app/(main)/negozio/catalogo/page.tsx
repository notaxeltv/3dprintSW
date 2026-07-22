"use client";

import { useEffect, useState } from "react";
import { ImageOff, PackageSearch, Ruler, FileDown } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import type { ShopCatalogItem } from "@/lib/shop";

export default function NegozioPage() {
  const [shopName, setShopName] = useState<string | null>(null);
  const [products, setProducts] = useState<ShopCatalogItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftMarkups, setDraftMarkups] = useState<Record<string, string>>({});
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/shop/catalog");
    if (!res.ok) return;
    const data = await res.json();
    setShopName(data.shopName);
    setProducts(data.products);
    const drafts: Record<string, string> = {};
    for (const product of data.products as ShopCatalogItem[]) {
      drafts[product.id] = product.markupPercent.toString();
    }
    setDraftMarkups(drafts);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveMarkup(productId: string) {
    const markupPercent = Number(draftMarkups[productId] ?? 0);
    setSavingId(productId);
    await fetch("/api/shop/markups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, markupPercent }),
    });
    setSavingId(null);
    load();
  }

  async function handleExportPdf() {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch("/api/shop/catalog/pdf");
      if (!res.ok) {
        setExportError("Impossibile generare il PDF. Riprova.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "catalogo-negozio.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Impossibile generare il PDF. Riprova.");
    } finally {
      setExporting(false);
    }
  }

  const filtered = products?.filter((p) =>
    (p.name + " " + (p.category ?? "") + " " + (p.subcategory ?? ""))
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Catalogo{shopName ? ` · ${shopName}` : ""}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Prezzi di acquisto dal fornitore, ricarico per articolo ed export PDF con i tuoi prezzi al cliente.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportPdf} disabled={exporting}>
            <FileDown size={16} /> {exporting ? "Generazione..." : "Esporta PDF"}
          </Button>
        </div>
      </div>

      {exportError && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {exportError}
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cerca per nome, categoria o sottocategoria..."
        className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />

      {!products && <p className="text-sm text-slate-500">Caricamento...</p>}

      {products && filtered && filtered.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <PackageSearch className="text-slate-300 dark:text-slate-600" size={40} />
          <p className="text-sm text-slate-500">
            {products.length === 0 ? "Nessun articolo nel catalogo." : "Nessun articolo corrisponde alla ricerca."}
          </p>
        </Card>
      )}

      {filtered && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((product) => {
            const markup = Number(draftMarkups[product.id] ?? product.markupPercent);
            const retailPrice = product.wholesalePrice * (1 + markup / 100);

            return (
              <Card key={product.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex h-40 sm:h-auto sm:w-40 shrink-0 items-center justify-center bg-slate-100 dark:bg-slate-800">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageOff className="text-slate-300 dark:text-slate-600" size={32} />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <h2 className="font-medium text-slate-900 dark:text-slate-100">{product.name}</h2>
                      {(product.category || product.subcategory) && (
                        <p className="text-xs text-slate-400">
                          {[product.category, product.subcategory].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {product.description && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {product.variants.length > 0 ? (
                      <div>
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <Ruler size={13} /> Misure e prezzi
                        </p>
                        <ul className="space-y-1 text-sm">
                          {product.variants.map((variant) => {
                            const variantRetail =
                              variant.wholesalePrice * (1 + markup / 100);
                            return (
                              <li
                                key={variant.id}
                                className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60"
                              >
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-600 dark:text-slate-300">
                                    {variant.label ? `${variant.label} · ` : ""}
                                    {variant.height}×{variant.width}×{variant.depth} cm
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(variantRetail)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                  Acquisto: {formatCurrency(variant.wholesalePrice)}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <p className="text-slate-500">
                          Prezzo acquisto:{" "}
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {formatCurrency(product.wholesalePrice)}
                          </span>
                        </p>
                        <p className="text-slate-500">
                          Prezzo al cliente:{" "}
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(retailPrice)}
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <div className="w-28">
                        <Label className="text-[11px]">Ricarico %</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={draftMarkups[product.id] ?? "0"}
                          onChange={(e) =>
                            setDraftMarkups((d) => ({ ...d, [product.id]: e.target.value }))
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-[120px] text-sm">
                        <p className="text-xs text-slate-400">Prezzo al cliente</p>
                        <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {product.variants.length > 0
                            ? "Vedi misure sopra"
                            : formatCurrency(retailPrice)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => saveMarkup(product.id)}
                        disabled={savingId === product.id}
                      >
                        {savingId === product.id ? "Salvo..." : "Salva ricarico"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
