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
      variants: { orderBy: { order: "asc" } },
      spool: true,
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
    const product = await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          name: parsed.data.name,
          description: parsed.data.description || null,
          category: parsed.data.category || null,
          subcategory: parsed.data.subcategory || null,
          imageUrl: parsed.data.imageUrl || null,
          material: parsed.data.material || null,
          printHours: parsed.data.printHours ?? null,
          weightGrams: parsed.data.weightGrams ?? null,
          spoolId: parsed.data.spoolId || null,
          costPerUnit: parsed.data.costPerUnit,
          price: parsed.data.price,
          minStock: parsed.data.minStock ?? 0,
          variants: parsed.data.variants?.length
            ? {
                create: parsed.data.variants.map((v, index) => ({
                  label: v.label || null,
                  height: v.height,
                  width: v.width,
                  depth: v.depth,
                  price: v.price,
                  order: index,
                })),
              }
            : undefined,
        },
        include: { variants: { orderBy: { order: "asc" } } },
      });
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
