import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { getAppOrigin, isAppHost } from "@/lib/domains";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PREFIXES = [
  "/api/auth/login",
  "/api/settings/public",
  "/api/catalog/public",
];

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
  if (pathname.startsWith("/api/catalog/public")) return false;
  return pathname.startsWith("/api/");
}

function isVetrinaPage(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/vetrina") ||
    pathname === "/catalogo" ||
    pathname.startsWith("/catalogo/")
  );
}

function redirectToApp(request: NextRequest, pathname: string) {
  const appOrigin = getAppOrigin(request.headers.get("host"));
  const url = new URL(pathname, appOrigin);
  url.search = request.nextUrl.search;
  return NextResponse.redirect(url);
}

async function handleDashboardRequest(request: NextRequest) {
  const { pathname } = request.nextUrl;
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

async function handleVetrinaRequest(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (isPublicApi(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (!isVetrinaPage(pathname)) {
    return redirectToApp(request, pathname);
  }

  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/vetrina", request.url));
  }

  if (pathname === "/catalogo" || pathname.startsWith("/catalogo/")) {
    return NextResponse.rewrite(new URL(`/vetrina${pathname}`, request.url));
  }

  return NextResponse.next();
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

  const host = request.headers.get("host");
  const onAppHost = isAppHost(host);

  if (onAppHost) {
    if (pathname.startsWith("/vetrina")) {
      return NextResponse.next();
    }
    return handleDashboardRequest(request);
  }

  return handleVetrinaRequest(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
