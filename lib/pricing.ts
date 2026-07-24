export function applyMarkup(wholesalePrice: number, markupPercent: number) {
  return wholesalePrice * (1 + markupPercent / 100);
}

export type PricingMode = "MARKUP" | "FIXED";

export const PRICING_MODES: { value: PricingMode; label: string; description: string }[] = [
  {
    value: "MARKUP",
    label: "Ricarico libero",
    description: "Ogni negozio imposta il proprio ricarico % su ogni articolo.",
  },
  {
    value: "FIXED",
    label: "Prezzo fisso (stile Apple)",
    description:
      "Tu imposti un prezzo al pubblico uguale per tutti. Vetrina e negozi mostrano lo stesso prezzo; il margine del negozio è automatico.",
  },
];

export function normalizePricingMode(value: string | null | undefined): PricingMode {
  return value === "FIXED" ? "FIXED" : "MARKUP";
}

export function isFixedPricing(mode: string | null | undefined): boolean {
  return normalizePricingMode(mode) === "FIXED";
}

export function resolveFixedRetailPrice(
  wholesalePrice: number,
  publicPrice: number | null | undefined
): number | null {
  if (publicPrice != null) return publicPrice;
  return null;
}

export function resolveRetailPrice(
  wholesalePrice: number,
  publicPrice: number | null | undefined,
  markupPercent: number,
  mode: PricingMode
): number | null {
  if (mode === "FIXED") {
    return resolveFixedRetailPrice(wholesalePrice, publicPrice);
  }
  return applyMarkup(wholesalePrice, markupPercent);
}

export function resolveVariantRetailPrice(
  variantWholesale: number,
  variantPublicPrice: number | null | undefined,
  productPublicPrice: number | null | undefined,
  markupPercent: number,
  mode: PricingMode
): number | null {
  if (mode === "FIXED") {
    if (variantPublicPrice != null) return variantPublicPrice;
    if (productPublicPrice != null) return productPublicPrice;
    return null;
  }
  return applyMarkup(variantWholesale, markupPercent);
}

export function computeMarginPercent(wholesalePrice: number, retailPrice: number | null): number | null {
  if (retailPrice == null || wholesalePrice <= 0) return null;
  return ((retailPrice - wholesalePrice) / wholesalePrice) * 100;
}

export function pricingModeLabel(mode: PricingMode): string {
  return PRICING_MODES.find((item) => item.value === mode)?.label ?? mode;
}
