import type { Metadata } from "next";

const DEFAULT_DESCRIPTION =
  "Catalogo stampe 3D su misura. Scopri i modelli disponibili e accedi alla dashboard dedicata.";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (url) return url;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type VetrinaMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
};

export function buildVetrinaMetadata({
  title,
  description,
  path = "",
  image,
  noIndex = false,
}: VetrinaMetadataInput): Metadata {
  const pageTitle = title ? `${title} · 3DPrintSW` : "3DPrintSW · Stampe 3D su misura";
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const canonical = absoluteUrl(path || "/");
  const ogImage = image ? absoluteUrl(image) : absoluteUrl("/icon");

  return {
    title: pageTitle,
    description: pageDescription,
    metadataBase: new URL(getSiteUrl()),
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "it_IT",
      url: canonical,
      title: pageTitle,
      description: pageDescription,
      siteName: "3DPrintSW",
      images: [{ url: ogImage, alt: pageTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
  };
}

export function defaultSiteDescription(companyName: string, custom?: string | null) {
  return (
    custom?.trim() ||
    `Scopri il catalogo stampe 3D di ${companyName}. Modelli, misure e prezzi ufficiali.`
  );
}
