import { NextRequest, NextResponse } from "next/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shopMarkupSchema } from "@/lib/validation";

export async function PUT(request: NextRequest) {
  const session = await requireShop();
  if (!session || !session.shopId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = shopMarkupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (settings?.pricingMode === "FIXED") {
    return NextResponse.json(
      {
        error:
          "Prezzi fissi attivi: il ricarico è impostato dal fornitore e non può essere modificato.",
      },
      { status: 403 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product) {
    return NextResponse.json({ error: "Modello non trovato" }, { status: 404 });
  }

  const markup = await prisma.shopProductMarkup.upsert({
    where: {
      shopId_productId: {
        shopId: session.shopId,
        productId: parsed.data.productId,
      },
    },
    create: {
      shopId: session.shopId,
      productId: parsed.data.productId,
      markupPercent: parsed.data.markupPercent,
    },
    update: {
      markupPercent: parsed.data.markupPercent,
    },
  });

  return NextResponse.json(markup);
}
