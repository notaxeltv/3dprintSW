import { prisma } from "@/lib/prisma";
import { toPublicProduct } from "@/lib/public-catalog";

async function getOrCreateSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: 1 } });
}

export async function getVetrinaSettings() {
  const settings = await getOrCreateSettings();
  return {
    companyName: settings.companyName,
    logoUrl: settings.logoUrl,
    instagramUrl: settings.instagramUrl,
    facebookUrl: settings.facebookUrl,
    tiktokUrl: settings.tiktokUrl,
    youtubeUrl: settings.youtubeUrl,
    whatsappUrl: settings.whatsappUrl,
    telegramUrl: settings.telegramUrl,
    linkedinUrl: settings.linkedinUrl,
    xUrl: settings.xUrl,
    websiteUrl: settings.websiteUrl,
    email: settings.email,
  };
}

export async function getVetrinaProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      variants: { orderBy: { order: "asc" } },
      images: { orderBy: { order: "asc" } },
    },
  });

  return products.map(toPublicProduct);
}

export async function getVetrinaProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { order: "asc" } },
      images: { orderBy: { order: "asc" } },
    },
  });

  return product ? toPublicProduct(product) : null;
}

export async function getVetrinaCategories() {
  const products = await prisma.product.findMany({
    select: { category: true },
    where: { category: { not: null } },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return products
    .map((product) => product.category)
    .filter((category): category is string => Boolean(category));
}
