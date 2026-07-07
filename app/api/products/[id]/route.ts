import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      prints: { orderBy: { printedAt: "desc" } },
      sales: { orderBy: { soldAt: "desc" } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Modello non trovato" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        category: parsed.data.category || null,
        imageUrl: parsed.data.imageUrl || null,
        material: parsed.data.material || null,
        printHours: parsed.data.printHours ?? null,
        costPerUnit: parsed.data.costPerUnit,
        price: parsed.data.price,
        minStock: parsed.data.minStock ?? 0,
      },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Modello non trovato" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Modello non trovato" }, { status: 404 });
  }
}
