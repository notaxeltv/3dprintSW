import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/catalogo", "/privacy", "/cookie"],
        disallow: [
          "/api/",
          "/login",
          "/negozio",
          "/impostazioni",
          "/ordini-negozi",
          "/negozi",
          "/stampe",
          "/vendite",
          "/vetrina",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
