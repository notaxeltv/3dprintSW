"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Boxes, LogIn } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import SocialLinks from "@/components/SocialLinks";
import type { Settings } from "@/lib/types";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [socialLinks, setSocialLinks] = useState<Partial<Settings>>({});

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setSocialLinks(data))
      .catch(() => setSocialLinks({}));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : data.error?.fieldErrors?.username?.[0] ?? "Accesso non riuscito."
        );
        return;
      }

      const next = searchParams.get("next");
      if (data.user.role === "SHOP") {
        router.push(next?.startsWith("/negozio") ? next : "/negozio");
      } else {
        router.push(next && !next.startsWith("/negozio") ? next : "/");
      }
      router.refresh();
    } catch {
      setError("Impossibile contattare il server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Boxes size={24} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">3DPrintSW</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Accedi con le credenziali fornite dall&apos;amministratore.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900"
        >
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            <LogIn size={16} /> {submitting ? "Accesso..." : "Accedi"}
          </Button>
        </form>

        <div className="space-y-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Seguici
          </p>
          <SocialLinks links={socialLinks} />
        </div>
      </div>
    </div>
  );
}
