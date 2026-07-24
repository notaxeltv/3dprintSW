import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "@/components/vetrina/ProductCard";
import Button from "@/components/ui/Button";
import { getDashboardLoginUrl } from "@/lib/domains";
import { getVetrinaProducts, getVetrinaSettings } from "@/lib/vetrina-data";

export default async function VetrinaHomePage() {
  const [settings, products] = await Promise.all([getVetrinaSettings(), getVetrinaProducts()]);
  const featured = products.slice(0, 6);

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:border-slate-800 dark:from-indigo-950/40 dark:via-slate-950 dark:to-slate-950">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Sparkles size={14} />
              Catalogo stampe 3D
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Scopri i modelli di {settings.companyName}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Esplora il catalogo completo con foto, misure disponibili e prezzi indicativi.
              Per negozi e amministratori è disponibile la Dashboard dedicata.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalogo">
                <Button>
                  Vedi catalogo <ArrowRight size={16} />
                </Button>
              </Link>
              <a href={getDashboardLoginUrl()}>
                <Button variant="secondary">Accedi alla Dashboard</Button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {featured.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                {product.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.coverImage} alt={product.name} className="aspect-square object-cover" />
                ) : (
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              In evidenza
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Una selezione dei modelli disponibili nel catalogo.
            </p>
          </div>
          <Link href="/catalogo" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Vedi tutti
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Il catalogo è in allestimento. Torna presto per scoprire i modelli disponibili.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
