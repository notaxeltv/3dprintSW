"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { ShoppingCart, Wallet, TrendingUp, Package } from "lucide-react";
import { ShopDashboardStats } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import EmptyChart from "@/components/ui/EmptyChart";

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("it-IT", { month: "short" }).format(new Date(year, month - 1, 1));
}

export default function NegozioDashboardPage() {
  const [stats, setStats] = useState<ShopDashboardStats | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/shop/stats"), fetch("/api/auth/me")]).then(async ([statsRes, meRes]) => {
      if (statsRes.ok) setStats(await statsRes.json());
      if (meRes.ok) {
        const me = await meRes.json();
        setShopName(me.user?.shopName ?? null);
      }
    });
  }, []);

  if (!stats) {
    return <p className="text-sm text-slate-500">Caricamento dashboard...</p>;
  }

  const { totals, monthly, topSold } = stats;
  const hasMonthlyData = monthly.some(
    (m) => m.revenue !== 0 || m.purchases !== 0 || m.sold !== 0
  );
  const chartData = monthly.map((m) => ({ ...m, label: monthLabel(m.month) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Dashboard{shopName ? ` · ${shopName}` : ""}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          I tuoi acquisti dal fornitore, le vendite ai clienti e i ricavi.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pezzi venduti"
          value={formatNumber(totals.sold)}
          icon={<ShoppingCart size={18} />}
          accent="indigo"
        />
        <StatCard
          label="Ricavi"
          value={formatCurrency(totals.revenue)}
          icon={<Wallet size={18} />}
          accent="emerald"
          hint="Incassati dai clienti"
        />
        <StatCard
          label="Acquisti"
          value={formatCurrency(totals.purchases)}
          icon={<Package size={18} />}
          accent="amber"
          hint="Pagati al fornitore"
        />
        <StatCard
          label="Margine"
          value={formatCurrency(totals.margin)}
          icon={<TrendingUp size={18} />}
          accent={totals.margin >= 0 ? "emerald" : "rose"}
          hint="Ricavi − acquisti"
        />
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Andamento ultimi 6 mesi
        </h2>
        {hasMonthlyData ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="revenue" name="Ricavi" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="purchases" name="Acquisti" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="margin" name="Margine" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart message="Registra le tue vendite per vedere l'andamento nel tempo." />
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Articoli più venduti
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Modello</th>
                <th className="px-5 py-3 font-medium">Venduti</th>
                <th className="px-5 py-3 font-medium">Ricavi</th>
                <th className="px-5 py-3 font-medium">Acquisti</th>
                <th className="px-5 py-3 font-medium">Margine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topSold.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400 dark:text-slate-500">
                    Nessuna vendita registrata ancora.
                  </td>
                </tr>
              )}
              {topSold.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{p.name}</td>
                  <td className="px-5 py-3">{formatNumber(p.sold)}</td>
                  <td className="px-5 py-3">{formatCurrency(p.revenue)}</td>
                  <td className="px-5 py-3">{formatCurrency(p.purchases)}</td>
                  <td
                    className={
                      p.margin >= 0
                        ? "px-5 py-3 font-semibold text-emerald-600 dark:text-emerald-400"
                        : "px-5 py-3 font-semibold text-rose-600 dark:text-rose-400"
                    }
                  >
                    {formatCurrency(p.margin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
