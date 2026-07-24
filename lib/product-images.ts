import type { ProductImageInput } from "@/lib/validation";

export function buildProductImagesCreate(images: ProductImageInput[] | undefined) {
  return images
    ?.filter((image) => image.url.trim())
    .map((image, index) => ({
      url: image.url.trim(),
      caption: image.caption || null,
      order: index,
    }));
}

export function resolveProductCoverImage(
  imageUrl: string | null | undefined,
  images: ProductImageInput[] | undefined
) {
  const trimmedCover = imageUrl?.trim();
  if (trimmedCover) return trimmedCover;
  return images?.find((image) => image.url.trim())?.url.trim() || null;
}
