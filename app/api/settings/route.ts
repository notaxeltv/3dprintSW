import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validation";

async function getOrCreateSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: 1 } });
}

export async function GET() {
  const settings = await getOrCreateSettings();
  const spools = await prisma.spool.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ ...settings, spools });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await getOrCreateSettings();

  const settings = await prisma.$transaction(async (tx) => {
    const updated = await tx.settings.update({
      where: { id: 1 },
      data: {
        companyName: parsed.data.companyName,
        logoUrl: parsed.data.logoUrl || null,
        electricityCostPerHour: parsed.data.electricityCostPerHour ?? 0,
      },
    });

    if (parsed.data.spools !== undefined) {
      const incomingIds = parsed.data.spools
        .map((s) => s.id)
        .filter((id): id is string => Boolean(id));

      await tx.spool.deleteMany({
        where: incomingIds.length
          ? { id: { notIn: incomingIds } }
          : {},
      });

      for (const spool of parsed.data.spools) {
        if (spool.id) {
          await tx.spool.update({
            where: { id: spool.id },
            data: {
              name: spool.name,
              material: spool.material || null,
              price: spool.price,
              weightGrams: spool.weightGrams,
            },
          });
        } else {
          await tx.spool.create({
            data: {
              name: spool.name,
              material: spool.material || null,
              price: spool.price,
              weightGrams: spool.weightGrams,
            },
          });
        }
      }
    }

    const spools = await tx.spool.findMany({ orderBy: { createdAt: "asc" } });
    return { ...updated, spools };
  });

  return NextResponse.json(settings);
}
