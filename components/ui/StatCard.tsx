import { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "./Card";

interface Props {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: "indigo" | "emerald" | "amber" | "rose" | "slate";
  hint?: string;
}

const accentClasses = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
};

export default function StatCard({ label, value, icon, accent = "indigo", hint }: Props) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className={clsx("flex h-10 w-10 items-center justify-center rounded-xl", accentClasses[accent])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
