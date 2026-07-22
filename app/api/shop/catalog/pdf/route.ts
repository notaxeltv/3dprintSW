import { NextResponse } from "next/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCatalogPdf } from "@/lib/pdf/catalog";
import { catalogItemToPdfProduct, getShopCatalogProducts } from "@/lib/shop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireShop();
  if (!session?.shopId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const [settings, catalog] = await Promise.all([
      prisma.settings.findUnique({ where: { id: 1 } }),
      getShopCatalogProducts(session.shopId),
    ]);

    const buffer = await generateCatalogPdf({
      companyName: settings?.companyName || "La mia azienda",
      logoUrl: settings?.logoUrl || null,
      coverSubtitle: session.shopName ?? catalog.shopName ?? undefined,
      products: catalog.products.map(catalogItemToPdfProduct),
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="catalogo-negozio.pdf"',
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Errore nella generazione del PDF del catalogo negozio", error);
    return NextResponse.json({ error: "Impossibile generare il PDF." }, { status: 500 });
  }
}
