import type { ProductImage, ProductVariant } from "@/lib/types";

type ProductRecord = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  imageUrl: string | null;
  material: string | null;
  publicPrice: number | null;
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
  priceFrom: number | null;
  priceTo: number | null;
  variants: {
    id: string;
    label: string | null;
    height: number;
    width: number;
    depth: number;
    price: number | null;
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

function resolveVariantPublicPrice(
  variant: ProductVariant,
  productPublicPrice: number | null
): number | null {
  if (variant.publicPrice != null) return variant.publicPrice;
  return productPublicPrice;
}

function collectPublicPrices(product: ProductRecord): number[] {
  const basePrice = product.publicPrice;

  if (product.variants?.length) {
    return product.variants
      .map((variant) => resolveVariantPublicPrice(variant, basePrice))
      .filter((price): price is number => price != null);
  }

  return basePrice != null ? [basePrice] : [];
}

export function toPublicProduct(product: ProductRecord): PublicProduct {
  const images = collectImages(product);
  const prices = collectPublicPrices(product);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    material: product.material,
    coverImage: images[0]?.url ?? null,
    images,
    priceFrom: prices.length ? Math.min(...prices) : null,
    priceTo: prices.length ? Math.max(...prices) : null,
    variants:
      product.variants?.map((variant) => ({
        id: variant.id,
        label: variant.label,
        height: variant.height,
        width: variant.width,
        depth: variant.depth,
        price: resolveVariantPublicPrice(variant, product.publicPrice),
      })) ?? [],
  };
}

export function formatPublicPrice(from: number | null, to: number | null): string {
  if (from == null || to == null) {
    return "Prezzo su richiesta";
  }

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

export function formatPublicVariantPrice(price: number | null): string {
  if (price == null) return "Su richiesta";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}
