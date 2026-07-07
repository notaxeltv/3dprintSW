import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saleLogSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId") ?? undefined;

  const sales = await prisma.saleLog.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { soldAt: "desc" },
    include: { product: { select: { id: true, name: true, imageUrl: true } } },
  });

  return NextResponse.json(sales);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = saleLogSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    include: { prints: true, sales: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Modello non trovato" }, { status: 404 });
  }

  const printed = product.prints.reduce((sum, p) => sum + p.quantity, 0);
  const sold = product.sales.reduce((sum, s) => sum + s.quantity, 0);
  const available = printed - sold;

  if (parsed.data.quantity > available) {
    return NextResponse.json(
      {
        error: `Disponibilità insufficiente: solo ${available} pezzi in magazzino per "${product.name}".`,
      },
      { status: 400 }
    );
  }

  const saleLog = await prisma.saleLog.create({
    data: {
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
      unitPrice: parsed.data.unitPrice ?? product.price,
      soldAt: parsed.data.soldAt ? new Date(parsed.data.soldAt) : new Date(),
      buyer: parsed.data.buyer || null,
      notes: parsed.data.notes || null,
    },
    include: { product: { select: { id: true, name: true, imageUrl: true } } },
  });

  return NextResponse.json(saleLog, { status: 201 });
}
