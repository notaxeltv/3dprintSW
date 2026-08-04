/**
 * Dati demo per screenshot e anteprima.
 * Uso: node scripts/seed-demo-data.mjs
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const DEMO_PRODUCTS = [
  {
    name: "Portachiavi personalizzato",
    description: "Portachiavi in PLA con nome o logo inciso. Ideale come gadget promozionale.",
    category: "Accessori",
    subcategory: "Portachiavi",
    material: "PLA",
    price: 2.5,
    publicPrice: 8.9,
    imageUrl: "https://picsum.photos/seed/keychain/800/800",
    images: [
      { url: "https://picsum.photos/seed/keychain/800/800", caption: "Vista frontale", order: 0 },
      { url: "https://picsum.photos/seed/keychain2/800/800", caption: "Dettaglio", order: 1 },
    ],
    variants: [{ label: "Standard", height: 4, width: 4, depth: 0.4, price: 2.5, publicPrice: 8.9 }],
  },
  {
    name: "Vaso geometrico",
    description: "Vaso decorativo con design moderno, disponibile in più dimensioni.",
    category: "Casa",
    subcategory: "Decor",
    material: "PETG",
    price: 6,
    publicPrice: 19.9,
    imageUrl: "https://picsum.photos/seed/vase/800/800",
    images: [{ url: "https://picsum.photos/seed/vase/800/800", order: 0 }],
    variants: [
      { label: "Piccolo", height: 12, width: 8, depth: 8, price: 6, publicPrice: 19.9 },
      { label: "Grande", height: 20, width: 12, depth: 12, price: 10, publicPrice: 29.9 },
    ],
  },
  {
    name: "Supporto smartphone",
    description: "Stand compatto per scrivania, compatibile con la maggior parte degli smartphone.",
    category: "Accessori",
    subcategory: "Tech",
    material: "PLA+",
    price: 3,
    publicPrice: 12.5,
    imageUrl: "https://picsum.photos/seed/phone/800/800",
    images: [{ url: "https://picsum.photos/seed/phone/800/800", order: 0 }],
    variants: [{ label: "Universale", height: 10, width: 8, depth: 8, price: 3, publicPrice: 12.5 }],
  },
  {
    name: "Organizer scrivania",
    description: "Portapenne e organizer modulare per mantenere ordinata la scrivania.",
    category: "Casa",
    subcategory: "Ufficio",
    material: "PLA",
    price: 8,
    publicPrice: 24.9,
    imageUrl: "https://picsum.photos/seed/desk/800/800",
    images: [{ url: "https://picsum.photos/seed/desk/800/800", order: 0 }],
    variants: [{ label: "3 scomparti", height: 8, width: 20, depth: 10, price: 8, publicPrice: 24.9 }],
  },
  {
    name: "Miniatura drago",
    description: "Figura decorativa per appassionati di fantasy e giochi da tavolo.",
    category: "Modellismo",
    subcategory: "Fantasy",
    material: "Resina",
    price: 12,
    publicPrice: 34.9,
    imageUrl: "https://picsum.photos/seed/dragon/800/800",
    images: [
      { url: "https://picsum.photos/seed/dragon/800/800", order: 0 },
      { url: "https://picsum.photos/seed/dragon2/800/800", order: 1 },
    ],
    variants: [{ label: "15 cm", height: 15, width: 10, depth: 10, price: 12, publicPrice: 34.9 }],
  },
  {
    name: "Clip cavi",
    description: "Set di clip per fissare i cavi sotto la scrivania o lungo le pareti.",
    category: "Accessori",
    subcategory: "Tech",
    material: "TPU",
    price: 1.5,
    publicPrice: 6.9,
    imageUrl: "https://picsum.photos/seed/cable/800/800",
    images: [{ url: "https://picsum.photos/seed/cable/800/800", order: 0 }],
    variants: [{ label: "Pack 5 pezzi", height: 2, width: 2, depth: 2, price: 1.5, publicPrice: 6.9 }],
  },
];

async function ensureAdmin() {
  const count = await prisma.user.count();
  if (count > 0) return;

  await prisma.user.create({
    data: {
      username: "admin",
      passwordHash: await bcrypt.hash("admin123", 12),
      role: "ADMIN",
    },
  });
  console.log("Admin creato (admin / admin123)");
}

async function ensureSettings() {
  await prisma.settings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      companyName: "La mia azienda 3D",
      siteDescription: "Stampe 3D personalizzate per casa, ufficio e negozi partner in tutta Italia.",
      legalAddress: "Via Example 1, 00100 Roma (RM), Italia",
      instagramUrl: "https://instagram.com/3dprintsw",
      facebookUrl: "https://facebook.com/3dprintsw",
      tiktokUrl: "https://tiktok.com/@3dprintsw",
      youtubeUrl: "https://youtube.com/@3dprintsw",
      whatsappUrl: "+39 333 1234567",
      telegramUrl: "https://t.me/3dprintsw",
      linkedinUrl: "https://linkedin.com/company/3dprintsw",
      xUrl: "https://x.com/3dprintsw",
      websiteUrl: "https://www.3dprintsw.it",
      email: "info@3dprintsw.it",
    },
    update: {
      companyName: "La mia azienda 3D",
      siteDescription: "Stampe 3D personalizzate per casa, ufficio e negozi partner in tutta Italia.",
      legalAddress: "Via Example 1, 00100 Roma (RM), Italia",
      instagramUrl: "https://instagram.com/3dprintsw",
      facebookUrl: "https://facebook.com/3dprintsw",
      tiktokUrl: "https://tiktok.com/@3dprintsw",
      youtubeUrl: "https://youtube.com/@3dprintsw",
      whatsappUrl: "+39 333 1234567",
      telegramUrl: "https://t.me/3dprintsw",
      linkedinUrl: "https://linkedin.com/company/3dprintsw",
      xUrl: "https://x.com/3dprintsw",
      websiteUrl: "https://www.3dprintsw.it",
      email: "info@3dprintsw.it",
    },
  });
}

async function ensureProducts() {
  const count = await prisma.product.count();
  if (count >= DEMO_PRODUCTS.length) {
    console.log(`Catalogo già popolato (${count} prodotti).`);
    return prisma.product.findFirst({ orderBy: { createdAt: "asc" } });
  }

  if (count > 0) {
    await prisma.product.deleteMany();
  }

  let first = null;
  for (const demo of DEMO_PRODUCTS) {
    const { images, variants, ...productData } = demo;
    const product = await prisma.product.create({
      data: {
        ...productData,
        costPerUnit: productData.price * 0.4,
        printHours: 2,
        minStock: 2,
        images: { create: images },
        variants: { create: variants },
      },
    });
    if (!first) first = product;
  }

  console.log(`Creati ${DEMO_PRODUCTS.length} prodotti demo.`);
  return first;
}

async function ensureShop(firstProduct) {
  const existing = await prisma.shop.findFirst({
    where: { user: { username: "negozio_demo" } },
    include: { user: true },
  });
  if (existing) return existing;

  const shop = await prisma.shop.create({
    data: {
      name: "Negozio Demo",
      active: true,
      user: {
        create: {
          username: "negozio_demo",
          passwordHash: await bcrypt.hash("negozio123", 12),
          role: "SHOP",
        },
      },
    },
    include: { user: true },
  });

  if (firstProduct) {
    const now = new Date();
    await prisma.printLog.create({
      data: {
        productId: firstProduct.id,
        quantity: 10,
        unitCost: 1.2,
        printedAt: now,
      },
    });
    await prisma.saleLog.create({
      data: {
        productId: firstProduct.id,
        quantity: 3,
        unitPrice: 8.9,
        soldAt: now,
        buyer: "Cliente demo",
      },
    });
    await prisma.shopSaleLog.create({
      data: {
        shopId: shop.id,
        productId: firstProduct.id,
        quantity: 2,
        unitWholesalePrice: 2.5,
        unitRetailPrice: 8.9,
        soldAt: now,
        buyer: "Cliente negozio",
      },
    });
    await prisma.shopOrder.create({
      data: {
        shopId: shop.id,
        status: "PENDING",
        notes: "Ordine demo per screenshot",
        items: {
          create: {
            productId: firstProduct.id,
            productName: firstProduct.name,
            quantity: 5,
            unitWholesalePrice: 2.5,
          },
        },
      },
    });
  }

  console.log("Negozio demo creato (negozio_demo / negozio123)");
  return shop;
}

await ensureAdmin();
await ensureSettings();
const firstProduct = await ensureProducts();
await ensureShop(firstProduct);

await prisma.$disconnect();
console.log("Seed demo completato.");
