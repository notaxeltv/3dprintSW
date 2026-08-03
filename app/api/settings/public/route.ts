import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getOrCreateSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: 1 } });
}

export async function GET() {
  const settings = await getOrCreateSettings();
  return NextResponse.json({
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
  });
}
