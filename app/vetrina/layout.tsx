import type { Metadata } from "next";
import CookieBanner from "@/components/vetrina/CookieBanner";
import VetrinaFooter from "@/components/vetrina/VetrinaFooter";
import VetrinaHeader from "@/components/vetrina/VetrinaHeader";
import { buildVetrinaMetadata, defaultSiteDescription } from "@/lib/seo";
import { getVetrinaSettings } from "@/lib/vetrina-data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getVetrinaSettings();
  return buildVetrinaMetadata({
    title: settings.companyName,
    description: defaultSiteDescription(settings.companyName, settings.siteDescription),
    path: "/",
    image: settings.logoUrl,
  });
}

export default async function VetrinaLayout({ children }: { children: React.ReactNode }) {
  const settings = await getVetrinaSettings();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <VetrinaHeader
        companyName={settings.companyName}
        logoUrl={settings.logoUrl}
        socialLinks={settings}
      />
      <main className="flex-1">{children}</main>
      <VetrinaFooter companyName={settings.companyName} socialLinks={settings} />
      <CookieBanner />
    </div>
  );
}
