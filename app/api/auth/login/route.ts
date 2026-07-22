import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  ensureDefaultAdmin,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  await ensureDefaultAdmin();

  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username: parsed.data.username },
    include: { shop: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });
  }

  if (user.role === "SHOP" && user.shop && !user.shop.active) {
    return NextResponse.json({ error: "Account negozio disattivato" }, { status: 403 });
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });
  }

  const sessionUser = {
    id: user.id,
    username: user.username,
    role: user.role as "ADMIN" | "SHOP",
    shopId: user.shopId,
    shopName: user.shop?.name ?? null,
  };

  const token = await createSessionToken(sessionUser);
  const response = NextResponse.json({ user: sessionUser });
  setSessionCookie(response, token);
  return response;
}
