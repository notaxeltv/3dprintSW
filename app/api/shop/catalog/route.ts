import { NextResponse } from "next/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shopCatalogItem } from "@/lib/shop";

export async function GET() {
  const session = await requireShop();
  if (!session || !session.shopId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const [products, markups] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ category: "asc" }, { subcategory: "asc" }, { name: "asc" }],
      include: { variants: { orderBy: { order: "asc" } } },
    }),
    prisma.shopProductMarkup.findMany({
      where: { shopId: session.shopId },
    }),
  ]);

  const markupByProduct = new Map(markups.map((m) => [m.productId, m.markupPercent]));

  const catalog = products.map((product) =>
    shopCatalogItem(product, markupByProduct.get(product.id) ?? 0)
  );

  return NextResponse.json({
    shopName: session.shopName,
    products: catalog,
  });
}
