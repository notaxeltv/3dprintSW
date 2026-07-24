import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductGallery from "@/components/vetrina/ProductGallery";
import { Card } from "@/components/ui/Card";
import { formatPublicPrice, formatPublicVariantPrice } from "@/lib/public-catalog";
import { getVetrinaProduct } from "@/lib/vetrina-data";

export default async function VetrinaProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getVetrinaProduct(id);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/catalogo"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} />
        Torna al catalogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery images={product.images} name={product.name} />

        <div className="space-y-6">
          <div className="space-y-3">
            {(product.category || product.subcategory) && (
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                {[product.category, product.subcategory].filter(Boolean).join(" · ")}
              </p>
            )}
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{product.name}</h1>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatPublicPrice(product.priceFrom, product.priceTo)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prezzo ufficiale al pubblico, uguale in vetrina e in tutti i negozi partner.
            </p>
          </div>

          {product.description && (
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                Descrizione
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {product.description}
              </p>
            </Card>
          )}

          {product.material && (
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                Materiale
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{product.material}</p>
            </Card>
          )}

          {product.variants.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                Misure disponibili
              </h2>
              <div className="space-y-2">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60"
                  >
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {variant.label || "Standard"}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        {variant.height} × {variant.width} × {variant.depth} cm
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatPublicVariantPrice(variant.price)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
