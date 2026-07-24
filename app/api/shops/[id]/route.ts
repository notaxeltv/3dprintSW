import { NextRequest, NextResponse } from "next/server";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shopUpdateSchema } from "@/lib/validation";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = shopUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const shop = await prisma.shop.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!shop || !shop.user) {
    return NextResponse.json({ error: "Negozio non trovato" }, { status: 404 });
  }

  if (parsed.data.username && parsed.data.username !== shop.user.username) {
    const taken = await prisma.user.findUnique({
      where: { username: parsed.data.username },
    });
    if (taken) {
      return NextResponse.json(
        { error: { fieldErrors: { username: ["Username già in uso"] } } },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.shop.update({
      where: { id },
      data: {
        name: parsed.data.name ?? shop.name,
        active: parsed.data.active ?? shop.active,
      },
    });

    const userData: { username?: string; passwordHash?: string } = {};
    if (parsed.data.username) userData.username = parsed.data.username;
    if (parsed.data.password) {
      userData.passwordHash = await hashPassword(parsed.data.password);
    }

    if (Object.keys(userData).length > 0) {
      await tx.user.update({ where: { id: shop.user!.id }, data: userData });
    }

    return tx.shop.findUniqueOrThrow({
      where: { id },
      include: { user: { select: { id: true, username: true } } },
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.shop.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Negozio non trovato" }, { status: 404 });
  }
}
