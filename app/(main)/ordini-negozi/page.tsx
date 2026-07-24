"use client";

import { useEffect, useState } from "react";
import type { ShopOrder } from "@/lib/types";
import {
  SHOP_ORDER_STATUSES,
  SHOP_ORDER_STATUS_LABELS,
  type ShopOrderStatus,
} from "@/lib/shop-order";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";

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

export default function OrdiniNegoziPage() {
  const [orders, setOrders] = useState<ShopOrder[] | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/shop-orders");
    if (res.ok) setOrders(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: ShopOrderStatus) {
    setUpdatingId(id);
    await fetch(`/api/shop-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    load();
  }

  const pendingCount = orders?.filter((o) => o.status === "PENDING").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Ordini negozi</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Richieste inviate dai negozi clienti direttamente dall&apos;app.
          {pendingCount > 0 && (
            <span className="ml-1 font-medium text-amber-600 dark:text-amber-400">
              {pendingCount} in attesa.
            </span>
          )}
        </p>
      </div>

      {!orders && <p className="text-sm text-slate-500">Caricamento...</p>}

      {orders && orders.length === 0 && (
        <Card className="p-8 text-center text-sm text-slate-500">
          Nessun ordine ricevuto dai negozi.
        </Card>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {order.shop?.name ?? "Negozio"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDate(order.createdAt)} · Totale {formatCurrency(order.total)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => updateStatus(order.id, e.target.value as ShopOrderStatus)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    {SHOP_ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {SHOP_ORDER_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-5 py-3">
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
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-3 dark:border-slate-800">
                    Note del negozio: {order.notes}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
