"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import type { ShopCatalogItem } from "@/lib/shop";
import type { ShopOrder } from "@/lib/types";
import { SHOP_ORDER_STATUS_LABELS, type ShopOrderStatus } from "@/lib/shop-order";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import ShopOrderForm from "@/components/ShopOrderForm";

function StatusBadge({ status }: { status: string }) {
  const label = SHOP_ORDER_STATUS_LABELS[status as ShopOrderStatus] ?? status;
  const colors: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    CONFIRMED: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    COMPLETED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    CANCELLED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${colors[status] ?? colors.PENDING}`}
    >
      {label}
    </span>
  );
}

export default function NegozioOrdiniPage() {
  const [products, setProducts] = useState<ShopCatalogItem[]>([]);
  const [orders, setOrders] = useState<ShopOrder[] | null>(null);

  async function load() {
    const [catalogRes, ordersRes] = await Promise.all([
      fetch("/api/shop/catalog"),
      fetch("/api/shop/orders"),
    ]);
    if (catalogRes.ok) {
      const catalog = await catalogRes.json();
      setProducts(catalog.products);
    }
    if (ordersRes.ok) {
      setOrders(await ordersRes.json());
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Ordini al fornitore</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Invia direttamente al fornitore cosa ti serve, senza passare da WhatsApp o social.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1 h-fit">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <ClipboardList size={16} className="text-indigo-600 dark:text-indigo-400" /> Nuovo ordine
          </h2>
          <ShopOrderForm products={products} onSaved={load} />
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {!orders && <p className="text-sm text-slate-500">Caricamento...</p>}

          {orders && orders.length === 0 && (
            <Card className="p-8 text-center text-sm text-slate-500">
              Nessun ordine inviato ancora.
            </Card>
          )}

          {orders?.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Ordine del {formatDate(order.createdAt)}
                  </p>
                  <p className="text-xs text-slate-500">Totale: {formatCurrency(order.total)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="px-5 py-3 space-y-2">
                <ul className="space-y-1 text-sm">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-2">
                      <span className="text-slate-700 dark:text-slate-300">
                        {item.productName}
                        {item.variantLabel ? ` · ${item.variantLabel}` : ""} × {item.quantity}
                      </span>
                      <span className="shrink-0 text-slate-600 dark:text-slate-400">
                        {formatCurrency(item.quantity * item.unitWholesalePrice)}
                      </span>
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    Note: {order.notes}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
