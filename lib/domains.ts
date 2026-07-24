export function normalizeHost(host: string | null | undefined): string {
  return (host ?? "").split(":")[0].toLowerCase();
}

export function isAppHost(host: string | null | undefined): boolean {
  const normalized = normalizeHost(host);

  if (process.env.APP_HOST) {
    return normalized === process.env.APP_HOST.toLowerCase();
  }

  if (normalized.startsWith("app.")) return true;

  // In locale la dashboard resta su localhost per non rompere lo sviluppo.
  return normalized === "localhost" || normalized === "127.0.0.1";
}

export function getAppOrigin(host: string | null | undefined): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  const rawHost = host ?? "localhost:3000";
  const normalized = normalizeHost(rawHost);
  const protocol = normalized === "localhost" || normalized === "127.0.0.1" ? "http" : "https";
  const port = rawHost.includes(":") ? `:${rawHost.split(":")[1]}` : "";

  if (normalized === "localhost" || normalized === "127.0.0.1") {
    return `${protocol}://${normalized}${port}`;
  }

  const apex = normalized.startsWith("www.") ? normalized.slice(4) : normalized;
  return `${protocol}://app.${apex}${port ? "" : ""}`;
}

export function getDashboardLoginUrl(host?: string | null): string {
  return `${getAppOrigin(host)}/login`;
}
