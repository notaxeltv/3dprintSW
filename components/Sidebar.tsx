"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Printer, ShoppingCart, Boxes } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/catalogo", label: "Catalogo", icon: Package },
  { href: "/stampe", label: "Stampe", icon: Printer },
  { href: "/vendite", label: "Vendite", icon: ShoppingCart },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex md:w-60 md:flex-col md:shrink-0 border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Boxes size={20} />
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-slate-900 text-sm">3DPrintSW</p>
            <p className="text-xs text-slate-400">Gestione stampe 3D</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 text-xs text-slate-400 border-t border-slate-200">
          Catalogo, stampe, vendite e profitti in un&apos;unica app.
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur px-2 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium",
                active ? "text-indigo-700" : "text-slate-500"
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
