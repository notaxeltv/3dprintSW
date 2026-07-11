"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageOff, Printer, ShoppingCart, Pencil, Trash2, Ruler } from "lucide-react";
import { formatCurrency, formatDate, formatNumber, formatUnitPrice } from "@/lib/format";
import type { Product, ProductVariant } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ProductForm from "@/components/ProductForm";
import PrintForm from "@/components/PrintForm";
import SaleForm from "@/components/SaleForm";

interface PrintEntry {
  id: string;
  quantity: number;
  unitCost: number;
  printedAt: string;
  notes: string | null;
}
interface SaleEntry {
  id: string;
  quantity: number;
  unitPrice: number;
  soldAt: string;
  buyer: string | null;
  notes: string | null;
}
interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  imageUrl: string | null;
  material: string | null;
  printHours: number | null;
  weightGrams: number | null;
  spoolId: string | null;
  labelOptionId: string | null;
  keychainId: string | null;
  costPerUnit: number;
  price: number;
  minStock: number;
  prints: PrintEntry[];
  sales: SaleEntry[];
  variants: ProductVariant[];
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);

  async function load() {
    const res = await fetch(`/api/products/${id}`);
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    setProduct(await res.json());
  }

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDeleteProduct() {
    if (!confirm("Eliminare definitivamente questo modello e tutto il suo storico?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.push("/catalogo");
  }

  async function handleDeletePrint(printId: string) {
    if (!confirm("Eliminare questa registrazione di stampa?")) return;
    await fetch(`/api/prints/${printId}`, { method: "DELETE" });
    load();
  }

  async function handleDeleteSale(saleId: string) {
    if (!confirm("Eliminare questa registrazione di vendita?")) return;
    await fetch(`/api/sales/${saleId}`, { method: "DELETE" });
    load();
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">Modello non trovato.</p>
        <Link href="/catalogo" className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          ← Torna al catalogo
        </Link>
      </div>
    );
  }

  if (!product) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Caricamento...</p>;
  }

  const printed = product.prints.reduce((s, p) => s + p.quantity, 0);
  const sold = product.sales.reduce((s, p) => s + p.quantity, 0);
  const revenue = product.sales.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
  const cost = product.prints.reduce((s, p) => s + p.quantity * p.unitCost, 0);
  const stock = printed - sold;
  const avgUnitCost = printed > 0 ? cost / printed : product.costPerUnit;
  const profit = revenue - avgUnitCost * sold;

  const productForForm: Product = {
    ...product,
    stats: { printed, sold, stock, revenue, cost, cogs: avgUnitCost * sold, profit },
    createdAt: "",
    updatedAt: "",
  };

  return (
    <div className="space-y-6">
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} /> Catalogo
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-1 h-fit">
          <div className="flex h-48 items-center justify-center bg-slate-100 dark:bg-slate-800">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <ImageOff className="text-slate-300 dark:text-slate-600" size={40} />
            )}
          </div>
          <div className="space-y-3 p-5">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{product.name}</h1>
              {(product.category || product.subcategory) && (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {[product.category, product.subcategory].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            {product.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300">{product.description}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                <p className="text-xs text-slate-400 dark:text-slate-500">Materiale</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{product.material || "—"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                <p className="text-xs text-slate-400 dark:text-slate-500">Ore stampa</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{product.printHours ?? "—"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                <p className="text-xs text-slate-400 dark:text-slate-500">Costo unitario</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{formatUnitPrice(product.costPerUnit)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                <p className="text-xs text-slate-400 dark:text-slate-500">Prezzo vendita</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{formatUnitPrice(product.price)}</p>
              </div>
            </div>

            {product.variants.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Ruler size={13} /> Misure disponibili
                </p>
                <ul className="space-y-1">
                  {product.variants.map((v) => (
                    <li
                      key={v.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5 text-sm dark:bg-slate-800/60"
                    >
                      <span className="text-slate-600 dark:text-slate-300">
                        {v.label ? `${v.label} · ` : ""}
                        {v.height}×{v.width}×{v.depth} cm
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {formatUnitPrice(v.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setEditOpen(true)}>
                <Pencil size={14} /> Modifica
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteProduct}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="p-4 text-center">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatNumber(printed)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Stampati</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatNumber(sold)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Venduti</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatNumber(stock)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">In stock</p>
            </Card>
            <Card className="p-4 text-center">
              <p className={`text-lg font-semibold ${profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {formatCurrency(profit)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Profitto</p>
            </Card>
          </div>

          <div className="flex gap-3">
            <Button size="sm" onClick={() => setPrintOpen(true)}>
              <Printer size={14} /> Registra stampa
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setSaleOpen(true)}>
              <ShoppingCart size={14} /> Registra vendita
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Storico stampe</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-2 font-medium">Data</th>
                    <th className="px-5 py-2 font-medium">Qtà</th>
                    <th className="px-5 py-2 font-medium">Costo unit.</th>
                    <th className="px-5 py-2 font-medium">Note</th>
                    <th className="px-5 py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {product.prints.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-center text-slate-400 dark:text-slate-500">
                        Nessuna stampa registrata.
                      </td>
                    </tr>
                  )}
                  {product.prints.map((p) => (
                    <tr key={p.id}>
                      <td className="px-5 py-2 text-slate-500 dark:text-slate-400">{formatDate(p.printedAt)}</td>
                      <td className="px-5 py-2">{formatNumber(p.quantity)}</td>
                      <td className="px-5 py-2">{formatCurrency(p.unitCost)}</td>
                      <td className="px-5 py-2 text-slate-500 dark:text-slate-400">{p.notes || "—"}</td>
                      <td className="px-5 py-2 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePrint(p.id)}>
                          <Trash2 size={14} className="text-rose-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Storico vendite</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-2 font-medium">Data</th>
                    <th className="px-5 py-2 font-medium">Qtà</th>
                    <th className="px-5 py-2 font-medium">Prezzo unit.</th>
                    <th className="px-5 py-2 font-medium">Acquirente</th>
                    <th className="px-5 py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {product.sales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-center text-slate-400 dark:text-slate-500">
                        Nessuna vendita registrata.
                      </td>
                    </tr>
                  )}
                  {product.sales.map((s) => (
                    <tr key={s.id}>
                      <td className="px-5 py-2 text-slate-500 dark:text-slate-400">{formatDate(s.soldAt)}</td>
                      <td className="px-5 py-2">{formatNumber(s.quantity)}</td>
                      <td className="px-5 py-2">{formatCurrency(s.unitPrice)}</td>
                      <td className="px-5 py-2 text-slate-500 dark:text-slate-400">{s.buyer || "—"}</td>
                      <td className="px-5 py-2 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSale(s.id)}>
                          <Trash2 size={14} className="text-rose-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {editOpen && (
        <Modal title="Modifica modello" onClose={() => setEditOpen(false)}>
          <ProductForm
            product={productForForm}
            onSaved={() => {
              setEditOpen(false);
              load();
            }}
            onCancel={() => setEditOpen(false)}
          />
        </Modal>
      )}

      {printOpen && (
        <Modal title="Registra stampa" onClose={() => setPrintOpen(false)}>
          <PrintForm
            products={[productForForm]}
            defaultProductId={product.id}
            onSaved={() => {
              setPrintOpen(false);
              load();
            }}
          />
        </Modal>
      )}

      {saleOpen && (
        <Modal title="Registra vendita" onClose={() => setSaleOpen(false)}>
          <SaleForm
            products={[productForForm]}
            defaultProductId={product.id}
            onSaved={() => {
              setSaleOpen(false);
              load();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
