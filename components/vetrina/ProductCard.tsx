import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatPublicPrice, type PublicProduct } from "@/lib/public-catalog";

export default function ProductCard({ product }: { product: PublicProduct }) {
  return (
    <Link href={`/catalogo/${product.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
          {product.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.coverImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
              <ImageOff size={32} />
            </div>
          )}
        </div>
        <div className="space-y-2 p-4">
          {(product.category || product.subcategory) && (
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              {[product.category, product.subcategory].filter(Boolean).join(" · ")}
            </p>
          )}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{product.name}</h3>
          {product.description && (
            <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
              {product.description}
            </p>
          )}
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {formatPublicPrice(product.priceFrom, product.priceTo)}
          </p>
          {product.images.length > 1 && (
            <p className="text-xs text-slate-400">{product.images.length} foto</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
