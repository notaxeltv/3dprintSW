"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Store, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Label, FieldError } from "@/components/ui/Field";

interface ShopRow {
  id: string;
  name: string;
  active: boolean;
  user: { id: string; username: string } | null;
}

function ShopForm({
  shop,
  onSaved,
  onCancel,
}: {
  shop?: ShopRow | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(shop?.name ?? "");
  const [username, setUsername] = useState(shop?.user?.username ?? "");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState(shop?.active ?? true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    const payload = shop
      ? {
          name,
          username,
          active,
          ...(password ? { password } : {}),
        }
      : { name, username, password };

    try {
      const res = await fetch(shop ? `/api/shops/${shop.id}` : "/api/shops", {
        method: shop ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.fieldErrors) {
          setErrors(data.error.fieldErrors);
        } else {
          setFormError(typeof data.error === "string" ? data.error : "Errore durante il salvataggio.");
        }
        return;
      }

      onSaved();
    } catch {
      setFormError("Impossibile contattare il server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {formError}
        </div>
      )}

      <div>
        <Label htmlFor="shop-name">Nome negozio *</Label>
        <Input id="shop-name" value={name} onChange={(e) => setName(e.target.value)} required />
        <FieldError>{errors.name?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="shop-username">Username login *</Label>
        <Input
          id="shop-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <FieldError>{errors.username?.[0]}</FieldError>
      </div>

      <div>
        <Label htmlFor="shop-password">
          Password {shop ? "(lascia vuoto per non cambiare)" : "*"}
        </Label>
        <Input
          id="shop-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!shop}
          minLength={shop ? undefined : 6}
        />
        <FieldError>{errors.password?.[0]}</FieldError>
      </div>

      {shop && (
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded border-slate-300"
          />
          Account attivo
        </label>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvataggio..." : shop ? "Salva" : "Crea negozio"}
        </Button>
      </div>
    </form>
  );
}

export default function NegoziPage() {
  const [shops, setShops] = useState<ShopRow[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ShopRow | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/shops");
    setShops(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  function loginUrl() {
    if (typeof window === "undefined") return "/login";
    return `${window.location.origin}/login`;
  }

  async function copyLink(shopId: string) {
    await navigator.clipboard.writeText(loginUrl());
    setCopiedId(shopId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo negozio e le sue credenziali di accesso?")) return;
    setDeletingId(id);
    await fetch(`/api/shops/${id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Negozi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Crea account per i negozi clienti. Ogni negozio accede dal browser con username e
            password che gli fornisci tu — nessuna registrazione automatica.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} /> Nuovo negozio
        </Button>
      </div>

      <Card className="p-4 text-sm text-slate-600 dark:text-slate-300">
        <p>
          <strong>Link di accesso per i negozi:</strong>{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
            {typeof window !== "undefined" ? loginUrl() : "/login"}
          </code>
        </p>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Condividi questo link insieme a username e password del negozio. Il negozio vedrà il
          catalogo con i tuoi prezzi e potrà impostare il proprio ricarico per ogni articolo.
        </p>
      </Card>

      {!shops && <p className="text-sm text-slate-500">Caricamento...</p>}

      {shops && shops.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <Store className="text-slate-300 dark:text-slate-600" size={40} />
          <p className="text-sm text-slate-500">Nessun negozio configurato.</p>
        </Card>
      )}

      {shops && shops.length > 0 && (
        <div className="space-y-3">
          {shops.map((shop) => (
            <Card key={shop.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium text-slate-900 dark:text-slate-100">{shop.name}</h2>
                    {!shop.active && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Disattivato
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Username: <span className="font-mono">{shop.user?.username}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => copyLink(shop.id)}>
                    {copiedId === shop.id ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId === shop.id ? "Copiato" : "Copia link"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditing(shop);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil size={14} /> Modifica
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(shop.id)}
                    disabled={deletingId === shop.id}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editing ? "Modifica negozio" : "Nuovo negozio"}
          onClose={() => setModalOpen(false)}
        >
          <ShopForm
            shop={editing}
            onSaved={() => {
              setModalOpen(false);
              setEditing(null);
              load();
            }}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
