import { prisma } from "@/lib/prisma";
import { normalizePricingMode, type PricingMode } from "@/lib/pricing";

export async function getPricingMode(): Promise<PricingMode> {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  return normalizePricingMode(settings?.pricingMode);
}
