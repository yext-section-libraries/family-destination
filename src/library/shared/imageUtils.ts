import type { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  isLocalizedAssetImage,
  resolveLocalizedAssetImage,
  type TranslatableAssetImage,
} from "@yext/visual-editor";

export type SectionImage =
  | ImageType
  | ComplexImageType
  | TranslatableAssetImage;

export const getSectionImageUrl = (
  image: unknown,
  locale?: string,
): string | undefined => {
  if (!image || typeof image !== "object") {
    return undefined;
  }

  const resolvedImage =
    locale && isLocalizedAssetImage(image)
      ? resolveLocalizedAssetImage(image, locale)
      : image;

  if (!resolvedImage || typeof resolvedImage !== "object") {
    return undefined;
  }

  if (
    "url" in resolvedImage &&
    typeof resolvedImage.url === "string" &&
    resolvedImage.url.trim()
  ) {
    return resolvedImage.url;
  }

  if (
    "image" in resolvedImage &&
    resolvedImage.image &&
    typeof resolvedImage.image === "object" &&
    "url" in resolvedImage.image &&
    typeof resolvedImage.image.url === "string" &&
    resolvedImage.image.url.trim()
  ) {
    return resolvedImage.image.url;
  }

  return undefined;
};

export const hasImageSource = (image: unknown): image is SectionImage =>
  Boolean(getSectionImageUrl(image));
