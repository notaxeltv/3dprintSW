import path from "path";
import { readFile } from "fs/promises";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

const PAGE_MARGIN = 56;
const ROW_HEIGHT = 92;
const HEADER_ROW_HEIGHT = 24;
const TABLE_START_PAGE = 4;

interface VariantLike {
  label: string | null;
  height: number;
  width: number;
  depth: number;
  price: number;
}

interface ProductLike {
  id: string;
  name: string;
  category: string | null;
  subcategory: string | null;
  imageUrl: string | null;
  price: number;
  variants: VariantLike[];
}

type Block =
  | { type: "category"; text: string; page: number; slot: number }
  | { type: "subcategory"; text: string; page: number; slot: number }
  | { type: "product"; product: ProductLike; page: number; slot: number };

interface TocEntry {
  level: 0 | 1;
  text: string;
  page: number;
}

function fmtNum(n: number): string {
  return Number(n.toFixed(2)).toString();
}

function collator(a: string, b: string) {
  return a.localeCompare(b, "it", { sensitivity: "base" });
}

function buildBlocks(products: ProductLike[]): { blocks: Block[]; toc: TocEntry[] } {
  const byCategory = new Map<string, ProductLike[]>();
  for (const p of products) {
    const key = p.category?.trim() || "Senza categoria";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(p);
  }

  const categoryNames = [...byCategory.keys()].sort((a, b) => {
    if (a === "Senza categoria") return 1;
    if (b === "Senza categoria") return -1;
    return collator(a, b);
  });

  const rawBlocks: Array<
    | { type: "category"; text: string }
    | { type: "subcategory"; text: string }
    | { type: "product"; product: ProductLike }
  > = [];

  for (const categoryName of categoryNames) {
    rawBlocks.push({ type: "category", text: categoryName });
    const items = byCategory.get(categoryName)!;

    const bySub = new Map<string, ProductLike[]>();
    for (const p of items) {
      const key = p.subcategory?.trim() || "";
      if (!bySub.has(key)) bySub.set(key, []);
      bySub.get(key)!.push(p);
    }

    const noSub = bySub.get("") ?? [];
    for (const p of [...noSub].sort((a, b) => collator(a.name, b.name))) {
      rawBlocks.push({ type: "product", product: p });
    }

    const subNames = [...bySub.keys()].filter((k) => k !== "").sort(collator);
    for (const subName of subNames) {
      rawBlocks.push({ type: "subcategory", text: subName });
      const subItems = [...bySub.get(subName)!].sort((a, b) => collator(a.name, b.name));
      for (const p of subItems) {
        rawBlocks.push({ type: "product", product: p });
      }
    }
  }

  const ROWS_PER_PAGE = Math.max(
    1,
    Math.floor(
      (841.89 - PAGE_MARGIN * 2 - HEADER_ROW_HEIGHT) / ROW_HEIGHT
    )
  );

  let slot = 0;
  const blocks: Block[] = [];
  const toc: TocEntry[] = [];

  for (const raw of rawBlocks) {
    if (raw.type !== "product") {
      const remainder = ROWS_PER_PAGE - (slot % ROWS_PER_PAGE);
      if (remainder < 2 && remainder !== ROWS_PER_PAGE) {
        slot += remainder;
      }
    }

    const page = TABLE_START_PAGE + Math.floor(slot / ROWS_PER_PAGE);
    const slotInPage = slot % ROWS_PER_PAGE;

    if (raw.type === "category") {
      blocks.push({ type: "category", text: raw.text, page, slot: slotInPage });
      toc.push({ level: 0, text: raw.text, page });
    } else if (raw.type === "subcategory") {
      blocks.push({ type: "subcategory", text: raw.text, page, slot: slotInPage });
      toc.push({ level: 1, text: raw.text, page });
    } else {
      blocks.push({ type: "product", product: raw.product, page, slot: slotInPage });
    }

    slot++;
  }

  return { blocks, toc };
}

async function loadImageBuffer(imageUrl: string | null): Promise<Buffer | null> {
  if (!imageUrl) return null;
  try {
    if (imageUrl.startsWith("/uploads/")) {
      const ext = path.extname(imageUrl).toLowerCase();
      if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") return null;
      return await readFile(path.join(process.cwd(), "public", imageUrl));
    }
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      const contentTypeGuess = imageUrl.toLowerCase();
      if (!contentTypeGuess.match(/\.(png|jpe?g)(\?.*)?$/)) return null;
      const res = await fetch(imageUrl);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
    return null;
  } catch {
    return null;
  }
}

export async function generateCatalogPdf(): Promise<Buffer> {
  const [settings, products] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 1 } }),
    prisma.product.findMany({
      include: { variants: { orderBy: { order: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const companyName = settings?.companyName || "La mia azienda";
  const logoUrl = settings?.logoUrl || null;

  const { blocks, toc } = buildBlocks(products as ProductLike[]);

  const doc = new PDFDocument({ size: "A4", margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN } });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const usableWidth = pageWidth - PAGE_MARGIN * 2;

  let pageNumber = 1;
  function addPage() {
    doc.addPage();
    pageNumber++;
  }

  function drawFooter() {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#94a3b8")
      .text(`Pagina ${pageNumber}`, PAGE_MARGIN, pageHeight - PAGE_MARGIN - 16, {
        width: usableWidth,
        align: "center",
        lineBreak: false,
      });
  }

  // Pagina 1 - copertina
  const logoBuffer = await loadImageBuffer(logoUrl);
  if (logoBuffer) {
    try {
      const maxLogoWidth = 220;
      const maxLogoHeight = 220;
      doc.image(logoBuffer, pageWidth / 2 - maxLogoWidth / 2, pageHeight / 2 - 220, {
        fit: [maxLogoWidth, maxLogoHeight],
        align: "center",
        valign: "center",
      });
    } catch {
      // ignora immagini non valide
    }
  }
  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor("#0f172a")
    .text(companyName, PAGE_MARGIN, pageHeight / 2 + 40, {
      width: usableWidth,
      align: "center",
    });
  doc
    .font("Helvetica")
    .fontSize(13)
    .fillColor("#64748b")
    .text("Catalogo prodotti", PAGE_MARGIN, pageHeight / 2 + 80, {
      width: usableWidth,
      align: "center",
    });
  drawFooter();

  // Pagina 2 - bianca
  addPage();

  // Pagina 3 - indice
  addPage();
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#0f172a").text("Indice", PAGE_MARGIN, PAGE_MARGIN);
  let tocY = PAGE_MARGIN + 40;
  if (toc.length === 0) {
    doc.font("Helvetica").fontSize(11).fillColor("#64748b").text("Nessuna categoria disponibile.", PAGE_MARGIN, tocY);
  } else {
    for (const entry of toc) {
      const indent = entry.level === 1 ? 20 : 0;
      const fontName = entry.level === 0 ? "Helvetica-Bold" : "Helvetica";
      const fontSize = entry.level === 0 ? 12 : 11;
      const textColor = entry.level === 0 ? "#0f172a" : "#334155";

      doc.font(fontName).fontSize(fontSize).fillColor(textColor);
      const pageLabel = String(entry.page);
      const pageLabelWidth = doc.widthOfString(pageLabel);
      const textMaxWidth = usableWidth - indent - pageLabelWidth - 10;
      doc.text(entry.text, PAGE_MARGIN + indent, tocY, { width: textMaxWidth, continued: false });
      doc.text(pageLabel, PAGE_MARGIN, tocY, { width: usableWidth, align: "right" });

      tocY += entry.level === 0 ? 24 : 20;

      if (tocY > pageHeight - PAGE_MARGIN - 20) {
        drawFooter();
        addPage();
        tocY = PAGE_MARGIN;
      }
    }
  }
  drawFooter();

  // Pagine tabella articoli
  const col1X = PAGE_MARGIN;
  const col1Width = 170;
  const col2X = col1X + col1Width;
  const col2Width = 110;
  const col3X = col2X + col2Width;
  const col3Width = usableWidth - col1Width - col2Width;
  const tableTop = PAGE_MARGIN + HEADER_ROW_HEIGHT;

  function drawTableHeader() {
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#475569");
    doc.text("ARTICOLO", col1X, PAGE_MARGIN + 6, { width: col1Width });
    doc.text("FOTO", col2X, PAGE_MARGIN + 6, { width: col2Width });
    doc.text("MISURE E PREZZO", col3X, PAGE_MARGIN + 6, { width: col3Width });
    doc
      .moveTo(PAGE_MARGIN, PAGE_MARGIN + HEADER_ROW_HEIGHT - 6)
      .lineTo(pageWidth - PAGE_MARGIN, PAGE_MARGIN + HEADER_ROW_HEIGHT - 6)
      .strokeColor("#e2e8f0")
      .stroke();
  }

  if (blocks.length === 0) {
    addPage();
    doc.font("Helvetica").fontSize(12).fillColor("#64748b").text("Il catalogo non contiene ancora articoli.", PAGE_MARGIN, PAGE_MARGIN);
    drawFooter();
  } else {
    let currentPage = 0;
    for (const block of blocks) {
      if (block.page !== currentPage) {
        if (currentPage !== 0) drawFooter();
        addPage();
        currentPage = block.page;
        drawTableHeader();
      }

      const rowY = tableTop + block.slot * ROW_HEIGHT;

      if (block.type === "category") {
        doc
          .rect(PAGE_MARGIN, rowY, usableWidth, ROW_HEIGHT - 10)
          .fill("#eef2ff");
        doc
          .font("Helvetica-Bold")
          .fontSize(13)
          .fillColor("#3730a3")
          .text(block.text, col1X + 8, rowY + (ROW_HEIGHT - 10) / 2 - 8, { width: usableWidth - 16 });
      } else if (block.type === "subcategory") {
        doc
          .font("Helvetica-BoldOblique")
          .fontSize(11)
          .fillColor("#475569")
          .text(block.text, col1X + 16, rowY + (ROW_HEIGHT - 10) / 2 - 7, { width: usableWidth - 24 });
        doc
          .moveTo(col1X, rowY + ROW_HEIGHT - 12)
          .lineTo(pageWidth - PAGE_MARGIN, rowY + ROW_HEIGHT - 12)
          .strokeColor("#f1f5f9")
          .stroke();
      } else {
        const { product } = block;

        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor("#0f172a")
          .text(product.name, col1X, rowY + 8, { width: col1Width - 10 });

        const imgSize = 68;
        const imgX = col2X + (col2Width - imgSize) / 2;
        const imgY = rowY + (ROW_HEIGHT - 10 - imgSize) / 2;
        const imageBuffer = await loadImageBuffer(product.imageUrl);
        if (imageBuffer) {
          try {
            doc.image(imageBuffer, imgX, imgY, { fit: [imgSize, imgSize], align: "center", valign: "center" });
          } catch {
            doc.rect(imgX, imgY, imgSize, imgSize).strokeColor("#e2e8f0").stroke();
          }
        } else {
          doc
            .rect(imgX, imgY, imgSize, imgSize)
            .fillAndStroke("#f8fafc", "#e2e8f0");
          doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor("#cbd5e1")
            .text("N/D", imgX, imgY + imgSize / 2 - 4, { width: imgSize, align: "center" });
        }

        const variantLines = product.variants.length
          ? product.variants.map(
              (v) => `${v.label ? v.label + " " : ""}${fmtNum(v.height)}×${fmtNum(v.width)}×${fmtNum(v.depth)} cm – ${fmtNum(v.price)}€`
            )
          : [`${fmtNum(product.price)}€`];

        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#334155")
          .text(variantLines.join("\n"), col3X, rowY + 8, { width: col3Width, lineGap: 2 });
      }
    }
    drawFooter();
  }

  doc.end();
  return done;
}
