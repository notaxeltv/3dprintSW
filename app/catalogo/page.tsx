"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, PackageSearch, ImageOff, FileDown } from "lucide-react";
import { Product } from "@/lib/types";
import { formatCurrency, formatNumber, formatUnitPrice } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ProductForm from "@/components/ProductForm";

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo modello? Verranno eliminate anche le stampe e le vendite collegate.")) {
      return;
    }
    setDeletingId(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
  }

  async function handleExportPdf() {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch("/api/catalog/pdf");
      if (!res.ok) {
        setExportError("Impossibile generare il PDF. Riprova.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "catalogo.pdf";
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
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Catalogo modelli</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Crea, aggiorna e monitora i modelli 3D del tuo catalogo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportPdf} disabled={exporting}>
            <FileDown size={16} /> {exporting ? "Generazione..." : "Esporta PDF"}
          </Button>
          <Button onClick={openCreate}>
            <Plus size={16} /> Nuovo modello
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

      {!products && <p className="text-sm text-slate-500 dark:text-slate-400">Caricamento...</p>}

      {products && filtered && filtered.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <PackageSearch className="text-slate-300 dark:text-slate-600" size={40} />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {products.length === 0
              ? "Nessun modello nel catalogo. Aggiungi il primo!"
              : "Nessun modello corrisponde alla ricerca."}
          </p>
          {products.length === 0 && (
            <Button onClick={openCreate} size="sm">
              <Plus size={16} /> Nuovo modello
            </Button>
          )}
        </Card>
      )}

      {filtered && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => {
            const lowStock = product.stats.stock <= product.minStock;
            return (
              <Card key={product.id} className="flex flex-col overflow-hidden">
                <Link href={`/catalogo/${product.id}`} className="block">
                  <div className="flex h-36 items-center justify-center bg-slate-100 dark:bg-slate-800">
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
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/catalogo/${product.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
                      >
                        {product.name}
                      </Link>
                      {lowStock && (
                        <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          Scorta bassa
                        </span>
                      )}
                    </div>
                    {(product.category || product.subcategory) && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {[product.category, product.subcategory].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2 text-center text-xs dark:bg-slate-800/60">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{formatNumber(product.stats.printed)}</p>
                      <p className="text-slate-400 dark:text-slate-500">Stampati</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{formatNumber(product.stats.sold)}</p>
                      <p className="text-slate-400 dark:text-slate-500">Venduti</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{formatNumber(product.stats.stock)}</p>
                      <p className="text-slate-400 dark:text-slate-500">In stock</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatUnitPrice(product.costPerUnit)} → {formatUnitPrice(product.price)}
                    </span>
                    <span
                      className={
                        product.stats.profit >= 0
                          ? "font-semibold text-emerald-600 dark:text-emerald-400"
                          : "font-semibold text-rose-600 dark:text-rose-400"
                      }
                    >
                      {formatCurrency(product.stats.profit)}
                    </span>
                  </div>

                  <div className="mt-auto flex gap-2 pt-2">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(product)}>
                      <Pencil size={14} /> Modifica
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editing ? "Modifica modello" : "Nuovo modello"}
          onClose={() => setModalOpen(false)}
        >
          <ProductForm
            product={editing}
            onSaved={handleSaved}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
