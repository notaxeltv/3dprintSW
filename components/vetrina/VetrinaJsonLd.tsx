import { absoluteUrl, getSiteUrl } from "@/lib/seo";
import { getVetrinaSettings } from "@/lib/vetrina-data";

export default async function VetrinaJsonLd() {
  const settings = await getVetrinaSettings();
  const url = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.companyName,
    url,
    logo: settings.logoUrl ? absoluteUrl(settings.logoUrl) : undefined,
    description: settings.siteDescription,
    email: settings.email?.replace(/^mailto:/i, ""),
    sameAs: [
      settings.instagramUrl,
      settings.facebookUrl,
      settings.youtubeUrl,
      settings.linkedinUrl,
      settings.websiteUrl,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
