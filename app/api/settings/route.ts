import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validation";
import { normalizeSocialLinksInput } from "@/lib/social";

async function getOrCreateSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: 1 } });
}

export async function GET() {
  const settings = await getOrCreateSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await getOrCreateSettings();
  const social = normalizeSocialLinksInput(parsed.data);

  const settings = await prisma.settings.update({
    where: { id: 1 },
    data: {
      companyName: parsed.data.companyName,
      logoUrl: parsed.data.logoUrl || null,
      ...social,
    },
  });

  return NextResponse.json(settings);
}
