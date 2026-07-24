import {
  computeMarginPercent,
  normalizePricingMode,
  resolveRetailPrice,
  resolveVariantRetailPrice,
  type PricingMode,
} from "@/lib/pricing";
import { prisma } from "@/lib/prisma";

export function shopCatalogItem(
  product: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    subcategory: string | null;
    imageUrl: string | null;
    price: number;
    publicPrice: number | null;
    variants: {
      id: string;
      label: string | null;
      height: number;
      width: number;
      depth: number;
      price: number;
      publicPrice: number | null;
    }[];
  },
  markupPercent: number,
  pricingMode: PricingMode
) {
  const retailPrice = resolveRetailPrice(
    product.price,
    product.publicPrice,
    markupPercent,
    pricingMode
  );
  const effectiveMarkup =
    pricingMode === "FIXED"
      ? (computeMarginPercent(product.price, retailPrice) ?? 0)
      : markupPercent;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    imageUrl: product.imageUrl,
    wholesalePrice: product.price,
    markupPercent: effectiveMarkup,
    retailPrice,
    pricingMode,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      height: variant.height,
      width: variant.width,
      depth: variant.depth,
      wholesalePrice: variant.price,
      retailPrice: resolveVariantRetailPrice(
        variant.price,
        variant.publicPrice,
        product.publicPrice,
        markupPercent,
        pricingMode
      ),
    })),
  };
}

export type ShopCatalogItem = ReturnType<typeof shopCatalogItem>;

export async function getShopCatalogProducts(shopId: string) {
  const [products, markups, shop, settings] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ category: "asc" }, { subcategory: "asc" }, { name: "asc" }],
      include: { variants: { orderBy: { order: "asc" } } },
    }),
    prisma.shopProductMarkup.findMany({ where: { shopId } }),
    prisma.shop.findUnique({ where: { id: shopId }, select: { name: true } }),
    prisma.settings.findUnique({ where: { id: 1 } }),
  ]);

  const pricingMode = normalizePricingMode(settings?.pricingMode);
  const markupByProduct = new Map(markups.map((m) => [m.productId, m.markupPercent]));
  const catalog = products.map((product) =>
    shopCatalogItem(product, markupByProduct.get(product.id) ?? 0, pricingMode)
  );

  return {
    shopName: shop?.name ?? null,
    pricingMode,
    products: catalog,
  };
}

export function catalogItemToPdfProduct(item: ShopCatalogItem) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    subcategory: item.subcategory,
    imageUrl: item.imageUrl,
    price: item.retailPrice ?? item.wholesalePrice,
    variants: item.variants.map((variant) => ({
      label: variant.label,
      height: variant.height,
      width: variant.width,
      depth: variant.depth,
      price: variant.retailPrice ?? variant.wholesalePrice,
    })),
  };
}

export function resolveShopSalePrices(
  catalogItem: ShopCatalogItem,
  variantId?: string | null
) {
  if (variantId) {
    const variant = catalogItem.variants.find((v) => v.id === variantId);
    if (!variant) return null;
    const retail = variant.retailPrice ?? variant.wholesalePrice;
    return {
      unitWholesalePrice: variant.wholesalePrice,
      unitRetailPrice: retail,
    };
  }
  const retail = catalogItem.retailPrice ?? catalogItem.wholesalePrice;
  return {
    unitWholesalePrice: catalogItem.wholesalePrice,
    unitRetailPrice: retail,
  };
}
