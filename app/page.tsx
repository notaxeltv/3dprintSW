"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Printer,
  ShoppingCart,
  Wallet,
  TrendingUp,
  AlertTriangle,
  PackageOpen,
} from "lucide-react";
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
import { DashboardStats } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import EmptyChart from "@/components/ui/EmptyChart";

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("it-IT", { month: "short" }).format(new Date(year, month - 1, 1));
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return <p className="text-sm text-slate-500">Caricamento dashboard...</p>;
  }

  const { totals, monthly, topProfitable, lowStock } = stats;
  const hasMonthlyData = monthly.some((m) => m.revenue !== 0 || m.cost !== 0);
  const chartData = monthly.map((m) => ({ ...m, label: monthLabel(m.month) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Panoramica del catalogo, delle stampe, delle vendite e del profitto.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Modelli in catalogo"
          value={formatNumber(totals.products)}
          icon={<Boxes size={18} />}
          accent="slate"
        />
        <StatCard
          label="Pezzi stampati"
          value={formatNumber(totals.printed)}
          icon={<Printer size={18} />}
          accent="indigo"
        />
        <StatCard
          label="Pezzi venduti"
          value={formatNumber(totals.sold)}
          icon={<ShoppingCart size={18} />}
          accent="amber"
          hint={`${formatNumber(totals.stock)} in magazzino`}
        />
        <StatCard
          label="Profitto netto"
          value={formatCurrency(totals.profit)}
          icon={<TrendingUp size={18} />}
          accent={totals.profit >= 0 ? "emerald" : "rose"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Ricavi totali"
          value={formatCurrency(totals.revenue)}
          icon={<Wallet size={18} />}
          accent="emerald"
        />
        <StatCard
          label="Costi di produzione"
          value={formatCurrency(totals.cost)}
          icon={<Printer size={18} />}
          accent="rose"
          hint="Su tutti i pezzi stampati"
        />
        <StatCard
          label="Valore magazzino"
          value={formatCurrency(totals.stockValue)}
          icon={<PackageOpen size={18} />}
          accent="indigo"
          hint="Costo dei pezzi non ancora venduti"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
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
                <Bar dataKey="cost" name="Costi" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profitto" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Registra stampe e vendite per vedere l'andamento nel tempo." />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <AlertTriangle size={16} className="text-amber-500" /> Scorte da ristampare
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">Nessun modello sotto scorta minima.</p>
          ) : (
            <ul className="space-y-3">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <Link href={`/catalogo/${p.id}`} className="font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
                    {p.name}
                  </Link>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    {formatNumber(p.stock)} pz
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Modelli più profittevoli</h2>
          <Link href="/catalogo" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            Vai al catalogo →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Modello</th>
                <th className="px-5 py-3 font-medium">Stampati</th>
                <th className="px-5 py-3 font-medium">Venduti</th>
                <th className="px-5 py-3 font-medium">Ricavi</th>
                <th className="px-5 py-3 font-medium">Profitto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topProfitable.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400 dark:text-slate-500">
                    Nessun dato disponibile ancora.
                  </td>
                </tr>
              )}
              {topProfitable.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">
                    <Link href={`/catalogo/${p.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{formatNumber(p.printed)}</td>
                  <td className="px-5 py-3">{formatNumber(p.sold)}</td>
                  <td className="px-5 py-3">{formatCurrency(p.revenue)}</td>
                  <td
                    className={
                      p.profit >= 0
                        ? "px-5 py-3 font-semibold text-emerald-600 dark:text-emerald-400"
                        : "px-5 py-3 font-semibold text-rose-600 dark:text-rose-400"
                    }
                  >
                    {formatCurrency(p.profit)}
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
