import ProductCard from "@/components/vetrina/ProductCard";
import { getVetrinaCategories, getVetrinaProducts } from "@/lib/vetrina-data";

export default async function VetrinaCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [products, categories] = await Promise.all([getVetrinaProducts(), getVetrinaCategories()]);
  const filtered = categoria
    ? products.filter((product) => product.category === categoria)
    : products;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Catalogo</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tutti i modelli disponibili con foto, misure e prezzi indicativi.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <a
            href="/catalogo"
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              !categoria
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
            }`}
          >
            Tutti
          </a>
          {categories.map((category) => (
            <a
              key={category}
              href={`/catalogo?categoria=${encodeURIComponent(category)}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                categoria === category
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
              }`}
            >
              {category}
            </a>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Nessun prodotto trovato in questa categoria.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
