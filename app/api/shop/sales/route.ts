import { NextRequest, NextResponse } from "next/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getShopCatalogProducts, resolveShopSalePrices } from "@/lib/shop";
import { shopSaleSchema } from "@/lib/validation";

export async function GET() {
  const session = await requireShop();
  if (!session?.shopId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const logs = await prisma.shopSaleLog.findMany({
    where: { shopId: session.shopId },
    orderBy: { soldAt: "desc" },
    include: {
      product: { select: { id: true, name: true, imageUrl: true } },
      variant: { select: { id: true, label: true } },
    },
  });

  return NextResponse.json(logs);
}

export async function POST(request: NextRequest) {
  const session = await requireShop();
  if (!session?.shopId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = shopSaleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const catalog = await getShopCatalogProducts(session.shopId);
  const catalogItem = catalog.products.find((p) => p.id === parsed.data.productId);
  if (!catalogItem) {
    return NextResponse.json({ error: "Modello non trovato" }, { status: 404 });
  }

  const prices = resolveShopSalePrices(catalogItem, parsed.data.variantId);
  if (!prices) {
    return NextResponse.json({ error: "Misura non valida" }, { status: 400 });
  }

  const log = await prisma.shopSaleLog.create({
    data: {
      shopId: session.shopId,
      productId: parsed.data.productId,
      variantId: parsed.data.variantId || null,
      quantity: parsed.data.quantity,
      unitWholesalePrice: prices.unitWholesalePrice,
      unitRetailPrice: parsed.data.unitRetailPrice ?? prices.unitRetailPrice,
      soldAt: parsed.data.soldAt ? new Date(parsed.data.soldAt) : new Date(),
      buyer: parsed.data.buyer || null,
      notes: parsed.data.notes || null,
    },
    include: {
      product: { select: { id: true, name: true, imageUrl: true } },
      variant: { select: { id: true, label: true } },
    },
  });

  return NextResponse.json(log, { status: 201 });
}
