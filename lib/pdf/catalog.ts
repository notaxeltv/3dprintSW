import path from "path";
import { readFile } from "fs/promises";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

const PAGE_MARGIN = 56;
const TABLE_HEADER_HEIGHT = 30;
const TABLE_START_PAGE = 4;
const SLOT_UNIT = 28;
const CATEGORY_SLOTS = 2;
const SUBCATEGORY_SLOTS = 1;
const IMAGE_BOX_WIDTH = 92;
const IMAGE_BOX_HEIGHT = 112;
const VARIANT_LINE_HEIGHT = 13;
const VARIANT_BLOCK_HEIGHT = VARIANT_LINE_HEIGHT * 4 + 6;
const VARIANT_BLOCK_GAP = 10;
const ROW_VERTICAL_PADDING = 20;

const NAVY = "#1d3557";
const NAVY_MUTED = "#7488a8";
const NAVY_LIGHT_LINE = "#dbe3ef";

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
  description: string | null;
  category: string | null;
  subcategory: string | null;
  imageUrl: string | null;
  price: number;
  variants: VariantLike[];
}

type RawBlock =
  | { type: "category"; text: string; hasOwnPage: boolean }
  | { type: "subcategory"; text: string }
  | { type: "product"; product: ProductLike };

type Block =
  | { type: "category"; text: string; page: number; slot: number; hasOwnPage: boolean }
  | { type: "subcategory"; text: string; page: number; slot: number }
  | { type: "product"; product: ProductLike; page: number; slot: number; slots: number };

interface TocEntry {
  level: 0 | 1;
  text: string;
  page: number | null;
}

import { PRICE_DECIMALS } from "@/lib/format";

function fmtNum(n: number): string {
  return Number(n.toFixed(2)).toString();
}

function fmtPrice(n: number): string {
  const fixed = n.toFixed(PRICE_DECIMALS);
  return fixed.replace(/\.?0+$/, "") || "0";
}

function collator(a: string, b: string) {
  return a.localeCompare(b, "it", { sensitivity: "base" });
}

function variantBlockHeight(label: string | null): number {
  return VARIANT_BLOCK_HEIGHT + (label ? VARIANT_LINE_HEIGHT : 0);
}

function productSlots(product: ProductLike): number {
  const variants = product.variants.length ? product.variants : [{ label: null }];
  const heights = variants.map((v) => variantBlockHeight(v.label));
  const variantsHeight = heights.reduce((a, b) => a + b, 0) + (heights.length - 1) * VARIANT_BLOCK_GAP;
  const contentHeight = Math.max(IMAGE_BOX_HEIGHT, variantsHeight, 40);
  return Math.max(1, Math.ceil((contentHeight + ROW_VERTICAL_PADDING) / SLOT_UNIT));
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

  const rawBlocks: RawBlock[] = [];

  for (const categoryName of categoryNames) {
    const items = byCategory.get(categoryName)!;

    const bySub = new Map<string, ProductLike[]>();
    for (const p of items) {
      const key = p.subcategory?.trim() || "";
      if (!bySub.has(key)) bySub.set(key, []);
      bySub.get(key)!.push(p);
    }

    const noSub = bySub.get("") ?? [];
    const subNames = [...bySub.keys()].filter((k) => k !== "").sort(collator);

    // Una categoria mostra un proprio numero di pagina solo se contiene
    // articoli senza sottocategoria; se raggruppa solo sottocategorie
    // resta un'etichetta senza numero, come nell'indice di riferimento.
    rawBlocks.push({ type: "category", text: categoryName, hasOwnPage: noSub.length > 0 });

    for (const p of [...noSub].sort((a, b) => collator(a.name, b.name))) {
      rawBlocks.push({ type: "product", product: p });
    }

    for (const subName of subNames) {
      rawBlocks.push({ type: "subcategory", text: subName });
      const subItems = [...bySub.get(subName)!].sort((a, b) => collator(a.name, b.name));
      for (const p of subItems) {
        rawBlocks.push({ type: "product", product: p });
      }
    }
  }

  const rowsPerPage = Math.max(
    1,
    Math.floor((841.89 - PAGE_MARGIN * 2 - TABLE_HEADER_HEIGHT) / SLOT_UNIT)
  );

  let slot = 0;
  const blocks: Block[] = [];
  const toc: TocEntry[] = [];

  for (const raw of rawBlocks) {
    const cost =
      raw.type === "category"
        ? CATEGORY_SLOTS
        : raw.type === "subcategory"
          ? SUBCATEGORY_SLOTS
          : productSlots(raw.product);
    const minRoom = raw.type === "product" ? cost : cost + 1;

    const remainder = rowsPerPage - (slot % rowsPerPage);
    if (remainder < minRoom && remainder !== rowsPerPage) {
      slot += remainder;
    }

    const page = TABLE_START_PAGE + Math.floor(slot / rowsPerPage);
    const slotInPage = slot % rowsPerPage;

    if (raw.type === "category") {
      blocks.push({ type: "category", text: raw.text, page, slot: slotInPage, hasOwnPage: raw.hasOwnPage });
      toc.push({ level: 0, text: raw.text, page: raw.hasOwnPage ? page : null });
    } else if (raw.type === "subcategory") {
      blocks.push({ type: "subcategory", text: raw.text, page, slot: slotInPage });
      toc.push({ level: 1, text: raw.text, page });
    } else {
      blocks.push({ type: "product", product: raw.product, page, slot: slotInPage, slots: cost });
    }

    slot += cost;
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
      .fillColor(NAVY_MUTED)
      .text(`Pag.${pageNumber}`, PAGE_MARGIN, pageHeight - PAGE_MARGIN - 16, {
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
    .fontSize(26)
    .fillColor(NAVY)
    .text(companyName, PAGE_MARGIN, pageHeight / 2 + 40, {
      width: usableWidth,
      align: "center",
    });
  drawFooter();

  // Pagina 2 - indice
  addPage();
  doc.font("Helvetica-Bold").fontSize(18).fillColor(NAVY).text("Indice", PAGE_MARGIN, PAGE_MARGIN);
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(NAVY_MUTED)
    .text("PAGINA", PAGE_MARGIN, PAGE_MARGIN + 4, { width: usableWidth, align: "right" });

  let tocY = PAGE_MARGIN + 42;
  if (toc.length === 0) {
    doc.font("Helvetica").fontSize(11).fillColor(NAVY_MUTED).text("Nessuna categoria disponibile.", PAGE_MARGIN, tocY);
  } else {
    for (const entry of toc) {
      const indent = entry.level === 1 ? 22 : 0;
      const fontName = entry.level === 0 ? "Helvetica-Bold" : "Helvetica";
      const fontSize = entry.level === 0 ? 12 : 11;

      doc.font(fontName).fontSize(fontSize).fillColor(NAVY);
      const pageLabel = entry.page != null ? String(entry.page) : "";
      const pageLabelWidth = pageLabel ? doc.widthOfString(pageLabel) : 0;
      const textMaxWidth = usableWidth - indent - pageLabelWidth - 10;
      doc.text(entry.text, PAGE_MARGIN + indent, tocY, { width: textMaxWidth, continued: false });
      if (pageLabel) {
        doc.text(pageLabel, PAGE_MARGIN, tocY, { width: usableWidth, align: "right" });
      }

      tocY += entry.level === 0 ? 24 : 20;

      if (tocY > pageHeight - PAGE_MARGIN - 20) {
        drawFooter();
        addPage();
        tocY = PAGE_MARGIN;
      }
    }
  }
  drawFooter();

  // Pagina 3 - bianca
  addPage();

  // Pagine tabella articoli
  const col1X = PAGE_MARGIN;
  const col1Width = 160;
  const col2X = col1X + col1Width;
  const col2Width = 130;
  const col3X = col2X + col2Width;
  const col3Width = usableWidth - col1Width - col2Width;
  const tableTop = PAGE_MARGIN + TABLE_HEADER_HEIGHT;

  function drawTableHeader() {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(NAVY);
    doc.text("NOME", col1X, PAGE_MARGIN + 8, { width: col1Width, align: "center" });
    doc.text("IMMAGINE", col2X, PAGE_MARGIN + 8, { width: col2Width, align: "center" });
    doc.text("DIMENSIONI E PREZZO", col3X, PAGE_MARGIN + 8, { width: col3Width, align: "center" });
    doc
      .moveTo(PAGE_MARGIN, PAGE_MARGIN + TABLE_HEADER_HEIGHT - 6)
      .lineTo(pageWidth - PAGE_MARGIN, PAGE_MARGIN + TABLE_HEADER_HEIGHT - 6)
      .strokeColor(NAVY_LIGHT_LINE)
      .stroke();
  }

  if (blocks.length === 0) {
    addPage();
    doc.font("Helvetica").fontSize(12).fillColor(NAVY_MUTED).text("Il catalogo non contiene ancora articoli.", PAGE_MARGIN, PAGE_MARGIN);
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

      const rowY = tableTop + block.slot * SLOT_UNIT;

      if (block.type === "category") {
        const rowHeight = CATEGORY_SLOTS * SLOT_UNIT;
        doc
          .font("Helvetica-Bold")
          .fontSize(13)
          .fillColor(NAVY)
          .text(block.text, col1X, rowY + rowHeight / 2 - 8, { width: usableWidth, align: "center" });
        doc
          .moveTo(col1X, rowY + rowHeight - 4)
          .lineTo(pageWidth - PAGE_MARGIN, rowY + rowHeight - 4)
          .strokeColor(NAVY_LIGHT_LINE)
          .stroke();
      } else if (block.type === "subcategory") {
        const rowHeight = SUBCATEGORY_SLOTS * SLOT_UNIT;
        doc
          .font("Helvetica-Oblique")
          .fontSize(11)
          .fillColor(NAVY_MUTED)
          .text(block.text, col1X, rowY + rowHeight / 2 - 6, { width: usableWidth, align: "center" });
      } else {
        const { product } = block;
        const rowHeight = block.slots * SLOT_UNIT;
        const centerY = rowY + rowHeight / 2;

        let nameY = centerY - 8;
        if (product.description) nameY -= 7;
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(NAVY)
          .text(product.name, col1X + 6, nameY, { width: col1Width - 12, align: "center" });
        if (product.description) {
          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(NAVY_MUTED)
            .text(product.description, col1X + 6, nameY + 15, { width: col1Width - 12, align: "center" });
        }

        const imgX = col2X + (col2Width - IMAGE_BOX_WIDTH) / 2;
        const imgY = centerY - IMAGE_BOX_HEIGHT / 2;
        const imageBuffer = await loadImageBuffer(product.imageUrl);
        if (imageBuffer) {
          try {
            doc.image(imageBuffer, imgX, imgY, {
              fit: [IMAGE_BOX_WIDTH, IMAGE_BOX_HEIGHT],
              align: "center",
              valign: "center",
            });
          } catch {
            doc.rect(imgX, imgY, IMAGE_BOX_WIDTH, IMAGE_BOX_HEIGHT).strokeColor(NAVY_LIGHT_LINE).stroke();
          }
        } else {
          doc.rect(imgX, imgY, IMAGE_BOX_WIDTH, IMAGE_BOX_HEIGHT).fillAndStroke("#f4f6fa", NAVY_LIGHT_LINE);
          doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor("#b7c2d6")
            .text("N/D", imgX, imgY + IMAGE_BOX_HEIGHT / 2 - 4, { width: IMAGE_BOX_WIDTH, align: "center" });
        }

        const variants = product.variants.length
          ? product.variants
          : [{ label: null, height: 0, width: 0, depth: 0, price: product.price, noDims: true }];
        const variantHeights = variants.map((v) => variantBlockHeight(v.label));
        const totalVariantsHeight =
          variantHeights.reduce((a, b) => a + b, 0) + (variants.length - 1) * VARIANT_BLOCK_GAP;
        let blockY = centerY - totalVariantsHeight / 2;

        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          const hasDims = !("noDims" in v);
          let lineY = blockY;
          doc.font("Helvetica").fontSize(9.5).fillColor(NAVY);
          if (v.label) {
            doc.font("Helvetica-Bold").text(v.label, col3X, lineY, { width: col3Width, align: "center" });
            lineY += VARIANT_LINE_HEIGHT;
            doc.font("Helvetica").fontSize(9.5).fillColor(NAVY);
          }
          if (hasDims) {
            doc.text(`Altezza ${fmtNum(v.height)}cm`, col3X, lineY, { width: col3Width, align: "center" });
            lineY += VARIANT_LINE_HEIGHT;
            doc.text(`Larghezza ${fmtNum(v.width)}cm`, col3X, lineY, { width: col3Width, align: "center" });
            lineY += VARIANT_LINE_HEIGHT;
            doc.text(`Profondità ${fmtNum(v.depth)}cm`, col3X, lineY, { width: col3Width, align: "center" });
            lineY += VARIANT_LINE_HEIGHT + 6;
          } else {
            lineY += VARIANT_LINE_HEIGHT * 3 + 6;
          }
          doc
            .font("Helvetica-Bold")
            .fontSize(10.5)
            .fillColor(NAVY)
            .text(`${fmtPrice(v.price)}€`, col3X, lineY, { width: col3Width, align: "center" });

          blockY += variantHeights[i] + VARIANT_BLOCK_GAP;
        }
      }
    }
    drawFooter();
  }

  doc.end();
  return done;
}
