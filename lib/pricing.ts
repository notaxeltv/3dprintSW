export function resolvePublicRetailPrice(publicPrice: number | null | undefined): number | null {
  if (publicPrice == null) return null;
  return publicPrice;
}

export function resolveVariantPublicRetailPrice(
  variantPublicPrice: number | null | undefined,
  productPublicPrice: number | null | undefined
): number | null {
  if (variantPublicPrice != null) return variantPublicPrice;
  return productPublicPrice ?? null;
}

export function computeMarginPercent(
  wholesalePrice: number,
  retailPrice: number | null
): number | null {
  if (retailPrice == null || wholesalePrice <= 0) return null;
  return ((retailPrice - wholesalePrice) / wholesalePrice) * 100;
}
