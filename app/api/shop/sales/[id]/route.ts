import { NextRequest, NextResponse } from "next/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireShop();
  if (!session?.shopId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  const log = await prisma.shopSaleLog.findFirst({
    where: { id, shopId: session.shopId },
  });
  if (!log) {
    return NextResponse.json({ error: "Vendita non trovata" }, { status: 404 });
  }

  await prisma.shopSaleLog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
