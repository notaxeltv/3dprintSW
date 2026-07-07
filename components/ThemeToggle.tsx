"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import clsx from "clsx";

const options = [
  { value: "light", label: "Chiaro", icon: Sun },
  { value: "dark", label: "Scuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />;
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          title={label}
          onClick={() => setTheme(value)}
          className={clsx(
            "flex flex-1 items-center justify-center rounded-md py-1.5 text-slate-500 transition-colors dark:text-slate-400",
            theme === value && "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
          )}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
