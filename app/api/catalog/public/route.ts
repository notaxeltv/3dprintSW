import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toPublicProduct } from "@/lib/public-catalog";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      variants: { orderBy: { order: "asc" } },
      images: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(products.map(toPublicProduct));
}
