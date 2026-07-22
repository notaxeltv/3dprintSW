"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Printer,
  ShoppingCart,
  Boxes,
  Settings,
  Store,
  LogOut,
} from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "./ThemeToggle";
import type { SessionUser } from "@/lib/session";

const adminLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/catalogo", label: "Catalogo", icon: Package },
  { href: "/stampe", label: "Stampe", icon: Printer },
  { href: "/vendite", label: "Vendite", icon: ShoppingCart },
  { href: "/negozi", label: "Negozi", icon: Store },
];

const shopLinks = [{ href: "/negozio", label: "Catalogo", icon: Package }];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  const links = user?.role === "SHOP" ? shopLinks : adminLinks;
  const subtitle =
    user?.role === "SHOP" ? (user.shopName ?? "Negozio") : "Gestione stampe 3D";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <aside className="hidden md:flex md:w-60 md:flex-col md:shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-200 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Boxes size={20} />
          </div>
          <div className="leading-tight min-w-0">
            <p className="font-semibold text-slate-900 text-sm dark:text-slate-100 truncate">
              3DPrintSW
            </p>
            <p className="text-xs text-slate-400 truncate">{subtitle}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
          {user?.role === "ADMIN" && (
            <Link
              href="/impostazioni"
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === "/impostazioni"
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              )}
            >
              <Settings size={18} />
              Impostazioni
            </Link>
          )}
        </nav>
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <LogOut size={18} />
            Esci
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur px-2 py-2 dark:border-slate-800 dark:bg-slate-900/95">
        {[
          ...links,
          ...(user?.role === "ADMIN"
            ? [{ href: "/impostazioni", label: "Altro", icon: Settings }]
            : []),
        ].map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium",
                active ? "text-indigo-700 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
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
