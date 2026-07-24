import { getVetrinaSettings } from "@/lib/vetrina-data";

export type LegalSettings = Awaited<ReturnType<typeof getLegalSettings>>;

export async function getLegalSettings() {
  const settings = await getVetrinaSettings();
  return {
    ...settings,
    privacyEmail: settings.email?.replace(/^mailto:/i, "") || null,
    siteDescription: settings.siteDescription,
    legalAddress: settings.legalAddress,
    vatNumber: settings.vatNumber,
  };
}

export function formatLegalContact(settings: LegalSettings) {
  const lines = [settings.companyName];
  if (settings.legalAddress) lines.push(settings.legalAddress);
  if (settings.vatNumber) lines.push(`P. IVA ${settings.vatNumber}`);
  if (settings.privacyEmail) lines.push(settings.privacyEmail);
  return lines;
}
