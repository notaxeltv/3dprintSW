import { applyMarkup } from "@/lib/session";
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

export async function getShopCatalogProducts(shopId: string) {
  const [products, markups, shop] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ category: "asc" }, { subcategory: "asc" }, { name: "asc" }],
      include: { variants: { orderBy: { order: "asc" } } },
    }),
    prisma.shopProductMarkup.findMany({ where: { shopId } }),
    prisma.shop.findUnique({ where: { id: shopId }, select: { name: true } }),
  ]);

  const markupByProduct = new Map(markups.map((m) => [m.productId, m.markupPercent]));
  const catalog = products.map((product) =>
    shopCatalogItem(product, markupByProduct.get(product.id) ?? 0)
  );

  return {
    shopName: shop?.name ?? null,
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
    price: item.retailPrice,
    variants: item.variants.map((variant) => ({
      label: variant.label,
      height: variant.height,
      width: variant.width,
      depth: variant.depth,
      price: variant.retailPrice,
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
    return {
      unitWholesalePrice: variant.wholesalePrice,
      unitRetailPrice: variant.retailPrice,
    };
  }
  return {
    unitWholesalePrice: catalogItem.wholesalePrice,
    unitRetailPrice: catalogItem.retailPrice,
  };
}
