import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { orderTotal } from "@/lib/shop-order";
import { prisma } from "@/lib/prisma";

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

  const data = orders.map((order) => ({
    id: order.id,
    shopId: order.shopId,
    status: order.status,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    total: orderTotal(order.items),
    items: order.items,
    shop: order.shop,
  }));

  return NextResponse.json(data);
}
