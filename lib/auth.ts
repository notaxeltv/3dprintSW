import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type { SessionUser, UserRole } from "@/lib/session";
export {
  applyMarkup,
  clearSessionCookie,
  createSessionToken,
  getSession,
  getSessionFromRequest,
  requireAdmin,
  requireShop,
  setSessionCookie,
} from "@/lib/session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function ensureDefaultAdmin() {
  const count = await prisma.user.count();
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  await prisma.user.create({
    data: {
      username,
      passwordHash: await hashPassword(password),
      role: "ADMIN",
    },
  });
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
}
