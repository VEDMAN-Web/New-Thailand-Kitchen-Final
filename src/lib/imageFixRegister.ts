/**
 * Frontend image-fix register for SEO audit slugs.
 * Replaces mislabelled stock / kitchen-as-media-wall / broken legacy blog files
 * with owned project photography. True TV-wall photography still belongs in CMS.
 */

const STOCK_HOST =
  /pexels|unsplash|pixabay|shutterstock|istockphoto|gettyimages/i;
const LEGACY_BLOG = /blogimage\s*\(\d+\)/i;
const GENERIC_KITCHEN = /\/products\/Kitchen[1-5]\.png$/i;

const GUIDE_FIX: Record<
  string,
  { image: string; gallery: [string, string] }
> = {
  "modern-kitchen-transformation": {
    image: "/products/Kitchen2.png",
    gallery: ["/products/Kitchen1.png", "/products/Kitchen3.png"],
  },
  "kitchen-ergonomics": {
    image: "/products/Kitchen3.png",
    gallery: ["/products/Kitchen2.png", "/products/Kitchen4.png"],
  },
  "functional-flow-ergonomics": {
    image: "/products/Kitchen3.png",
    gallery: ["/products/Kitchen2.png", "/products/Kitchen4.png"],
  },
  "the-art-of-teak": {
    image: "/products/Kitchen4.png",
    gallery: ["/products/Kitchen5.png", "/products/Kitchen1.png"],
  },
  "the-marble-masterclass": {
    image: "/products/Kitchen5.png",
    gallery: ["/products/Kitchen4.png", "/products/Kitchen2.png"],
  },
  "open-concept-kitchen-design": {
    image: "/products/Kitchen1.png",
    gallery: ["/products/Kitchen2.png", "/products/Kitchen5.png"],
  },
  "living-in-the-heart-of-the-home": {
    image: "/products/Kitchen2.png",
    gallery: ["/products/Kitchen3.png", "/products/Kitchen1.png"],
  },
};

const CATEGORY_FIX: Record<string, string> = {
  "entertainment-units": "/features/image2.png",
  "entertainment-unit": "/features/image2.png",
  "media-wall": "/features/image2.png",
  "media-walls": "/features/image2.png",
};

export function isUntrustedStockImage(url: string): boolean {
  const value = String(url || "");
  if (!value) return false;
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }
  return STOCK_HOST.test(decoded) || LEGACY_BLOG.test(decoded);
}

export function fixedGuideMedia(
  slug: string,
  currentImage: string,
  currentGallery?: string[]
): { image: string; gallery?: [string, string] } {
  const key = String(slug || "")
    .trim()
    .toLowerCase();
  const mapped = GUIDE_FIX[key];
  if (mapped) return mapped;
  if (isUntrustedStockImage(currentImage)) {
    return {
      image: "/products/Kitchen1.png",
      gallery: currentGallery?.length
        ? undefined
        : ["/products/Kitchen2.png", "/products/Kitchen3.png"],
    };
  }
  return { image: currentImage };
}

export function fixedCategoryImage(slug: string, currentImage: string): string {
  const key = String(slug || "")
    .trim()
    .toLowerCase();
  const mapped = CATEGORY_FIX[key];
  if (mapped) {
    if (!currentImage || GENERIC_KITCHEN.test(currentImage) || isUntrustedStockImage(currentImage)) {
      return mapped;
    }
  }
  if (isUntrustedStockImage(currentImage)) return "/products/Kitchen1.png";
  return currentImage || "/products/Kitchen1.png";
}

export function isMediaWallSlug(slug: string): boolean {
  return /entertainment|media-wall|tv-wall|tvwall/i.test(String(slug || ""));
}
