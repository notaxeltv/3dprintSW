import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";
import { buildProductImagesCreate, resolveProductCoverImage } from "@/lib/product-images";

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
      images: { orderBy: { order: "asc" } },
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

  const imagesCreate = buildProductImagesCreate(parsed.data.images);

  try {
    const product = await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          name: parsed.data.name,
          description: parsed.data.description || null,
          category: parsed.data.category || null,
          subcategory: parsed.data.subcategory || null,
          imageUrl: resolveProductCoverImage(parsed.data.imageUrl, parsed.data.images),
          material: parsed.data.material || null,
          printHours: parsed.data.printHours ?? null,
          costPerUnit: parsed.data.costPerUnit,
          price: parsed.data.price,
          publicPrice: parsed.data.publicPrice,
          minStock: parsed.data.minStock ?? 0,
          variants: parsed.data.variants?.length
            ? {
                create: parsed.data.variants.map((v, index) => ({
                  label: v.label || null,
                  height: v.height,
                  width: v.width,
                  depth: v.depth,
                  price: v.price,
                  publicPrice: v.publicPrice ?? null,
                  order: index,
                })),
              }
            : undefined,
          images: imagesCreate?.length ? { create: imagesCreate } : undefined,
        },
        include: {
          variants: { orderBy: { order: "asc" } },
          images: { orderBy: { order: "asc" } },
        },
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
