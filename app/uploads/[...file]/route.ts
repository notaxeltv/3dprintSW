import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// In modalità "standalone" (usata per l'eseguibile desktop) Next.js
// fotografa i file statici di public/ all'avvio del server e non vede
// i file aggiunti successivamente (es. immagini caricate dall'utente).
// Questa route legge invece il file dal disco ad ogni richiesta, così
// le immagini appena caricate sono visibili subito, sia in sviluppo
// che nell'eseguibile impacchettato.

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string[] }> }
) {
  const { file } = await params;

  // Evita path traversal: ogni segmento deve essere un nome file semplice.
  if (!file.length || file.some((segment) => segment.includes("..") || segment.includes("/") || segment.includes("\\"))) {
    return NextResponse.json({ error: "Percorso non valido." }, { status: 400 });
  }

  const ext = path.extname(file[file.length - 1]).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return NextResponse.json({ error: "Tipo di file non supportato." }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadsDir, ...file);

  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) throw new Error("not a file");
    const buffer = await readFile(filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File non trovato." }, { status: 404 });
  }
}
