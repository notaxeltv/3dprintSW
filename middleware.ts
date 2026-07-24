import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PREFIXES = ["/api/auth/login", "/api/settings/public"];

const ADMIN_ONLY_PREFIXES = [
  "/",
  "/catalogo",
  "/stampe",
  "/vendite",
  "/ordini-negozi",
  "/impostazioni",
  "/negozi",
];

const SHOP_ONLY_PREFIXES = ["/negozio"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isPublicApi(pathname: string) {
  return PUBLIC_API_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isAdminPath(pathname: string) {
  if (pathname === "/") return true;
  return ADMIN_ONLY_PREFIXES.some(
    (path) => path !== "/" && (pathname === path || pathname.startsWith(`${path}/`))
  );
}

function isShopPath(pathname: string) {
  return SHOP_ONLY_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isAdminApi(pathname: string) {
  if (pathname.startsWith("/api/auth")) return false;
  if (pathname.startsWith("/api/shop")) return false;
  return pathname.startsWith("/api/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".") ||
    pathname === "/manifest.webmanifest"
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);

  if (isPublicPath(pathname)) {
    if (session && pathname === "/login") {
      const redirectUrl = session.role === "SHOP" ? "/negozio" : "/";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      if (isPublicApi(pathname)) {
        return NextResponse.next();
      }
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role === "SHOP") {
    if (isAdminPath(pathname) || (pathname.startsWith("/api/") && isAdminApi(pathname))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Accesso negato" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/negozio", request.url));
    }
  }

  if (session.role === "ADMIN") {
    if (isShopPath(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
