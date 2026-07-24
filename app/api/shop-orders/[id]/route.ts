import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { orderTotal } from "@/lib/shop-order";
import { prisma } from "@/lib/prisma";
import { shopOrderStatusSchema } from "@/lib/validation";

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
    shop: { id: string; name: string };
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
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const orders = await prisma.shopOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      shop: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(orders.map(serializeOrder));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = shopOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const order = await prisma.shopOrder.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        items: true,
        shop: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(serializeOrder(order));
  } catch {
    return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
  }
}
