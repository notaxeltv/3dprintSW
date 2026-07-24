"use client";

import { useEffect, useState } from "react";
import { Trash2, ShoppingCart } from "lucide-react";
import type { ShopCatalogItem } from "@/lib/shop";
import type { ShopSaleLog } from "@/lib/types";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ShopSaleForm from "@/components/ShopSaleForm";

export default function NegozioVenditePage() {
  const [products, setProducts] = useState<ShopCatalogItem[]>([]);
  const [logs, setLogs] = useState<ShopSaleLog[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const [catalogRes, logsRes] = await Promise.all([
      fetch("/api/shop/catalog"),
      fetch("/api/shop/sales"),
    ]);
    if (catalogRes.ok) {
      const catalog = await catalogRes.json();
      setProducts(catalog.products);
    }
    if (logsRes.ok) {
      setLogs(await logsRes.json());
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa registrazione di vendita?")) return;
    setDeletingId(id);
    await fetch(`/api/shop/sales/${id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
  }

  const totalQuantity = logs?.reduce((sum, l) => sum + l.quantity, 0) ?? 0;
  const totalRevenue = logs?.reduce((sum, l) => sum + l.quantity * l.unitRetailPrice, 0) ?? 0;
  const totalPurchases =
    logs?.reduce((sum, l) => sum + l.quantity * l.unitWholesalePrice, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Vendite</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Registra le vendite ai tuoi clienti per aggiornare ricavi, acquisti e grafici.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1 h-fit">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <ShoppingCart size={16} className="text-indigo-600 dark:text-indigo-400" /> Nuova vendita
          </h2>
          <ShopSaleForm products={products} onSaved={load} />
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Pezzi venduti</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
                {formatNumber(totalQuantity)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Ricavi</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(totalRevenue)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Acquisti</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(totalPurchases)}
              </p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Modello</th>
                    <th className="px-4 py-3 font-medium">Qtà</th>
                    <th className="px-4 py-3 font-medium">Prezzo cliente</th>
                    <th className="px-4 py-3 font-medium">Acquisto</th>
                    <th className="px-4 py-3 font-medium">Totale</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs && logs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                        Nessuna vendita registrata.
                      </td>
                    </tr>
                  )}
                  {logs?.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {log.product.name}
                        {log.variant?.label ? ` · ${log.variant.label}` : ""}
                      </td>
                      <td className="px-4 py-3">{formatNumber(log.quantity)}</td>
                      <td className="px-4 py-3">{formatCurrency(log.unitRetailPrice)}</td>
                      <td className="px-4 py-3">{formatCurrency(log.unitWholesalePrice)}</td>
                      <td className="px-4 py-3">{formatCurrency(log.quantity * log.unitRetailPrice)}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {formatDate(log.soldAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                        >
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
    </div>
  );
}
