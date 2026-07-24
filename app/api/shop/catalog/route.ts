import { NextResponse } from "next/server";
import { requireShop } from "@/lib/auth";
import { getShopCatalogProducts } from "@/lib/shop";

export async function GET() {
  const session = await requireShop();
  if (!session?.shopId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const catalog = await getShopCatalogProducts(session.shopId);
  return NextResponse.json({
    shopName: session.shopName ?? catalog.shopName,
    products: catalog.products,
  });
}
