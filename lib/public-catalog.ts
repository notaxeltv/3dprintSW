import type { ProductImage, ProductVariant } from "@/lib/types";

type ProductRecord = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  imageUrl: string | null;
  material: string | null;
  price: number;
  variants?: ProductVariant[];
  images?: ProductImage[];
};

export type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  material: string | null;
  coverImage: string | null;
  images: { url: string; caption: string | null }[];
  priceFrom: number;
  priceTo: number;
  variants: {
    id: string;
    label: string | null;
    height: number;
    width: number;
    depth: number;
    price: number;
  }[];
};

function collectImages(product: ProductRecord) {
  const gallery =
    product.images?.map((image) => ({
      url: image.url,
      caption: image.caption ?? null,
    })) ?? [];

  if (gallery.length > 0) return gallery;

  if (product.imageUrl) {
    return [{ url: product.imageUrl, caption: null }];
  }

  return [];
}

function collectPrices(product: ProductRecord) {
  const variantPrices = product.variants?.map((variant) => variant.price) ?? [];
  if (variantPrices.length > 0) return variantPrices;
  return [product.price];
}

export function toPublicProduct(product: ProductRecord): PublicProduct {
  const images = collectImages(product);
  const prices = collectPrices(product);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    material: product.material,
    coverImage: images[0]?.url ?? null,
    images,
    priceFrom: Math.min(...prices),
    priceTo: Math.max(...prices),
    variants:
      product.variants?.map((variant) => ({
        id: variant.id,
        label: variant.label,
        height: variant.height,
        width: variant.width,
        depth: variant.depth,
        price: variant.price,
      })) ?? [],
  };
}

export function formatPublicPrice(from: number, to: number): string {
  if (from === to) {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(from);
  }

  return `da ${new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(from)}`;
}
