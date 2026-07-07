import { NextResponse } from "next/server";
import { generateCatalogPdf } from "@/lib/pdf/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const buffer = await generateCatalogPdf();
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="catalogo.pdf"',
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Errore nella generazione del PDF del catalogo", error);
    return NextResponse.json({ error: "Impossibile generare il PDF." }, { status: 500 });
  }
}
