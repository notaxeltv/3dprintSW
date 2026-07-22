import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shopCreateSchema } from "@/lib/validation";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, username: true } } },
  });

  return NextResponse.json(shops);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = shopCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });
  if (existing) {
    return NextResponse.json(
      { error: { fieldErrors: { username: ["Username già in uso"] } } },
      { status: 400 }
    );
  }

  const shop = await prisma.$transaction(async (tx) => {
    const createdShop = await tx.shop.create({
      data: { name: parsed.data.name },
    });

    await tx.user.create({
      data: {
        username: parsed.data.username,
        passwordHash: await hashPassword(parsed.data.password),
        role: "SHOP",
        shopId: createdShop.id,
      },
    });

    return tx.shop.findUniqueOrThrow({
      where: { id: createdShop.id },
      include: { user: { select: { id: true, username: true } } },
    });
  });

  return NextResponse.json(shop, { status: 201 });
}
