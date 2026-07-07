import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { printLogSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId") ?? undefined;

  const prints = await prisma.printLog.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { printedAt: "desc" },
    include: { product: { select: { id: true, name: true, imageUrl: true } } },
  });

  return NextResponse.json(prints);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = printLogSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) {
    return NextResponse.json({ error: "Modello non trovato" }, { status: 404 });
  }

  const printLog = await prisma.printLog.create({
    data: {
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
      unitCost: parsed.data.unitCost ?? product.costPerUnit,
      printedAt: parsed.data.printedAt ? new Date(parsed.data.printedAt) : new Date(),
      notes: parsed.data.notes || null,
    },
    include: { product: { select: { id: true, name: true, imageUrl: true } } },
  });

  return NextResponse.json(printLog, { status: 201 });
}
