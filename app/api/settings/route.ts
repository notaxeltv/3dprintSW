import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validation";

async function getOrCreateSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: 1 } });
}

type PriceItem = { id?: string; name: string; price: number };

async function syncLabelOptions(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  items: PriceItem[] | undefined
) {
  if (items === undefined) return;
  const incomingIds = items.map((s) => s.id).filter((id): id is string => Boolean(id));
  await tx.labelOption.deleteMany({
    where: incomingIds.length ? { id: { notIn: incomingIds } } : {},
  });
  for (const item of items) {
    const data = { name: item.name, price: item.price };
    if (item.id) await tx.labelOption.update({ where: { id: item.id }, data });
    else await tx.labelOption.create({ data });
  }
}

async function syncKeychains(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  items: PriceItem[] | undefined
) {
  if (items === undefined) return;
  const incomingIds = items.map((s) => s.id).filter((id): id is string => Boolean(id));
  await tx.keychain.deleteMany({
    where: incomingIds.length ? { id: { notIn: incomingIds } } : {},
  });
  for (const item of items) {
    const data = { name: item.name, price: item.price };
    if (item.id) await tx.keychain.update({ where: { id: item.id }, data });
    else await tx.keychain.create({ data });
  }
}

export async function GET() {
  const settings = await getOrCreateSettings();
  const [spools, labelOptions, keychains] = await Promise.all([
    prisma.spool.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.labelOption.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.keychain.findMany({ orderBy: { createdAt: "asc" } }),
  ]);
  return NextResponse.json({ ...settings, spools, labelOptions, keychains });
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
        where: incomingIds.length ? { id: { notIn: incomingIds } } : {},
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

    await syncLabelOptions(tx, parsed.data.labelOptions);
    await syncKeychains(tx, parsed.data.keychains);

    const [spools, labelOptions, keychains] = await Promise.all([
      tx.spool.findMany({ orderBy: { createdAt: "asc" } }),
      tx.labelOption.findMany({ orderBy: { createdAt: "asc" } }),
      tx.keychain.findMany({ orderBy: { createdAt: "asc" } }),
    ]);

    return { ...updated, spools, labelOptions, keychains };
  });

  return NextResponse.json(settings);
}
