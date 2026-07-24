import { NextRequest, NextResponse } from "next/server";
import { requireShop } from "@/lib/auth";
import { orderTotal } from "@/lib/shop-order";
import { getShopCatalogProducts, resolveShopSalePrices } from "@/lib/shop";
import { prisma } from "@/lib/prisma";
import { shopOrderCreateSchema } from "@/lib/validation";

function serializeOrder(
  order: {
    id: string;
    shopId: string;
    status: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    items: {
      id: string;
      productId: string;
      variantId: string | null;
      productName: string;
      variantLabel: string | null;
      quantity: number;
      unitWholesalePrice: number;
    }[];
    shop?: { id: string; name: string };
  }
) {
  return {
    id: order.id,
    shopId: order.shopId,
    status: order.status,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    total: orderTotal(order.items),
    items: order.items,
    shop: order.shop,
  };
}

export async function GET() {
  const session = await requireShop();
  if (!session?.shopId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const orders = await prisma.shopOrder.findMany({
    where: { shopId: session.shopId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return NextResponse.json(orders.map(serializeOrder));
}

export async function POST(request: NextRequest) {
  const session = await requireShop();
  if (!session?.shopId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = shopOrderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const catalog = await getShopCatalogProducts(session.shopId);
  const lineData: {
    productId: string;
    variantId: string | null;
    productName: string;
    variantLabel: string | null;
    quantity: number;
    unitWholesalePrice: number;
  }[] = [];

  for (const item of parsed.data.items) {
    const catalogItem = catalog.products.find((p) => p.id === item.productId);
    if (!catalogItem) {
      return NextResponse.json({ error: "Modello non trovato nel catalogo" }, { status: 404 });
    }

    const prices = resolveShopSalePrices(catalogItem, item.variantId);
    if (!prices) {
      return NextResponse.json({ error: "Misura non valida" }, { status: 400 });
    }

    const variant = item.variantId
      ? catalogItem.variants.find((v) => v.id === item.variantId)
      : null;

    lineData.push({
      productId: item.productId,
      variantId: item.variantId ?? null,
      productName: catalogItem.name,
      variantLabel: variant?.label ?? null,
      quantity: item.quantity,
      unitWholesalePrice: prices.unitWholesalePrice,
    });
  }

  const order = await prisma.shopOrder.create({
    data: {
      shopId: session.shopId,
      notes: parsed.data.notes || null,
      items: { create: lineData },
    },
    include: { items: true },
  });

  return NextResponse.json(serializeOrder(order), { status: 201 });
}
