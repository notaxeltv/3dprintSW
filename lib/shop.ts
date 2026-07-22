import { applyMarkup } from "@/lib/session";

export function shopCatalogItem(
  product: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    subcategory: string | null;
    imageUrl: string | null;
    price: number;
    variants: {
      id: string;
      label: string | null;
      height: number;
      width: number;
      depth: number;
      price: number;
    }[];
  },
  markupPercent: number
) {
  const retailPrice = applyMarkup(product.price, markupPercent);
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    imageUrl: product.imageUrl,
    wholesalePrice: product.price,
    markupPercent,
    retailPrice,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      height: variant.height,
      width: variant.width,
      depth: variant.depth,
      wholesalePrice: variant.price,
      retailPrice: applyMarkup(variant.price, markupPercent),
    })),
  };
}

export type ShopCatalogItem = ReturnType<typeof shopCatalogItem>;
