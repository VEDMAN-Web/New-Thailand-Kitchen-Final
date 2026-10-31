export type ProductLayout =
  | "Modern"
  | "Islands"
  | "U Shape"
  | "L Shape"
  | "Straight"
  | "T Shape";

export interface ProductFeature {
  title: string;
  description: string;
}

export interface GalleryTile {
  image: string;
  caption: string;
}

export interface ProductItem {
  id: number;
  slug: string;
  name: string;
  layout: string;
  layoutType: ProductLayout;
  finish: string;
  material: string;
  style: string;
  color: string;
  image: string;
  bestSeller?: boolean;
  heroImages: [string, string, string];
  tag: string;
  headline: string;
  description: string;
  gallery: GalleryTile[];
  features: ProductFeature[];
  detailImages: string[];
  contactImage: string;
  contactEyebrow?: unknown;
  contactTitle?: unknown;
  contactFormTitle?: unknown;
  pdfUrl?: string;
  icon?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  indexable?: boolean;
}

export const productLayouts: ProductLayout[] = [
  "Modern",
  "Islands",
  "U Shape",
  "L Shape",
  "Straight",
  "T Shape",
];

/** Layout tabs — All + each layout + Best Seller */
export const productFilterTabs = ["All", ...productLayouts, "Best Seller"] as const;
export type ProductFilterTab = (typeof productFilterTabs)[number];

export function normalizeCategoryKey(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "-");
}

const CANONICAL_LABEL_BY_KEY: Record<string, string> = {
  modern: "Modern",
  islands: "Islands",
  "u-shape": "U Shape",
  "l-shape": "L Shape",
  straight: "Straight",
  "t-shape": "T Shape",
  "best-seller": "Best Seller",
  bestseller: "Best Seller",
};

/** Collapse "L shape" / "l-shape" / "L Shape" to one site label. */
export function canonicalCategoryLabel(raw: string): string {
  const trimmed = String(raw || "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return CANONICAL_LABEL_BY_KEY[normalizeCategoryKey(trimmed)] || trimmed;
}

/**
 * Same category chips on /products and in admin: canonical layouts first,
 * then extra CMS/product labels, then Best Seller. Case-insensitive unique.
 */
export function collectProductFilterTabs(extraLabels: Iterable<string> = []): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string) => {
    const label = canonicalCategoryLabel(raw);
    if (!label) return;
    const key = normalizeCategoryKey(label);
    if (!key || key === "all" || key === "best-seller" || key === "bestseller") return;
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(label);
  };
  for (const label of productLayouts) push(label);
  for (const label of extraLabels) push(label);
  return ["All", ...ordered, "Best Seller"];
}

/**
 * Convert a category/tab label into a URL-safe slug, e.g. "U Shape" -> "u-shape".
 * Shared between the products listing tabs and the /products/[slug] route so
 * that category browsing gets real, crawlable URLs like /products/u-shape.
 */
export function tabToSlug(tab: string): string {
  return tab.toLowerCase().trim().replace(/\s+/g, "-");
}

/**
 * Reverse of tabToSlug: given a URL segment (or query value) and the list of
 * known tab labels, return the matching tab label, or null if there is no match.
 */
export function tabFromSlugValue(
  value: string | null | undefined,
  tabs: string[]
): string | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim().replace(/[_\s]+/g, "-");
  if (normalized === "all") return "All";
  if (normalized === "best-seller" || normalized === "bestseller") {
    return "Best Seller";
  }
  const match = tabs.find((tab) => tabToSlug(tab) === normalized);
  return match ?? null;
}

export const productHero = {
  label: "Collection",
  title: "Products",
  video: "/product/productVideo.mp4",
};

export const filterOptions = {
  style: ["Select Style", "Contemporary", "Classic", "Minimal", "Luxury"],
  color: ["Color", "White", "Oak", "Walnut", "Black", "Grey"],
  finish: ["Finish", "Matte lacquer", "Gloss lacquer", "Natural oil", "Veneer"],
  material: ["Material", "Oak veneer", "Walnut", "Laminate", "Solid wood"],
};

export const sortOptions = ["Sort By", "Newest", "Name A–Z", "Name Z–A"];

const IMG = [
  "/products/Kitchen1.png",
  "/products/Kitchen2.png",
  "/products/Kitchen3.png",
  "/products/Kitchen4.png",
  "/products/Kitchen5.png",
  "/products/Kitchen6.png",
];

const HERO_FALLBACK = "/product/product.png";

const defaultGallery = (name: string): GalleryTile[] => [
  { image: IMG[0], caption: `${name} Series Open...` },
  { image: IMG[1], caption: `${name} Series Open...` },
  { image: IMG[2], caption: `${name} Series Open...` },
  { image: IMG[3], caption: `${name} Series Open...` },
  { image: IMG[5], caption: `${name} Series Open...` },
];

function makeProduct(
  partial: Omit<
    ProductItem,
    | "heroImages"
    | "tag"
    | "headline"
    | "description"
    | "gallery"
    | "features"
    | "detailImages"
    | "contactImage"
  > &
    Partial<
      Pick<
        ProductItem,
        | "heroImages"
        | "tag"
        | "headline"
        | "description"
        | "gallery"
        | "features"
        | "detailImages"
        | "contactImage"
      >
    >
): ProductItem {
  return {
    tag: "Core Component",
    headline:
      "The Art of Teak: Why Heritage Timber Remains the Ultimate Kitchen Luxury",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character and elevates the kitchen into a lasting heirloom.",
    heroImages: [
      partial.image,
      IMG[(partial.id % 6)],
      IMG[((partial.id + 1) % 6)],
    ],
    gallery: defaultGallery(partial.name.split(" ")[0]),
    features: [],
    detailImages: [IMG[4], IMG[2]],
    contactImage: IMG[3],
    ...partial,
  };
}

export const productItems: ProductItem[] = [
  makeProduct({
    id: 1,
    slug: "obsidian-bay",
    name: "Obsidian Bay",
    layout: "Island layout",
    layoutType: "Islands",
    finish: "Matte lacquer",
    material: "Oak veneer",
    style: "Contemporary",
    color: "Black",
    image: IMG[0],
    bestSeller: true,
    heroImages: [HERO_FALLBACK, IMG[0], IMG[1]],
    headline:
      "The Art of Teak: Why Heritage Timber Remains the Ultimate Kitchen Luxury",
    description:
      "Obsidian Bay pairs matte dark cabinetry with warm timber undertones — a quiet, gallery-like presence designed for open-plan living and island entertaining.",
  }),
  makeProduct({
    id: 2,
    slug: "pearl-harbor",
    name: "Pearl Harbor",
    layout: "Straight layout",
    layoutType: "Straight",
    finish: "Gloss lacquer",
    material: "Laminate",
    style: "Minimal",
    color: "White",
    image: IMG[1],
    bestSeller: true,
    heroImages: [IMG[1], IMG[2], IMG[3]],
  }),
  makeProduct({
    id: 3,
    slug: "teak-atelier",
    name: "Teak Atelier",
    layout: "L Shape layout",
    layoutType: "L Shape",
    finish: "Natural oil",
    material: "Solid wood",
    style: "Classic",
    color: "Oak",
    image: IMG[2],
    bestSeller: true,
    heroImages: [IMG[2], IMG[0], IMG[5]],
  }),
  makeProduct({
    id: 4,
    slug: "midnight-gallery",
    name: "Midnight Gallery",
    layout: "U Shape layout",
    layoutType: "U Shape",
    finish: "Matte lacquer",
    material: "Walnut",
    style: "Luxury",
    color: "Walnut",
    image: IMG[3],
    heroImages: [IMG[3], IMG[4], IMG[1]],
  }),
  makeProduct({
    id: 5,
    slug: "soft-horizon",
    name: "Soft Horizon",
    layout: "Island layout",
    layoutType: "Modern",
    finish: "Veneer",
    material: "Oak veneer",
    style: "Contemporary",
    color: "Grey",
    image: IMG[4],
    bestSeller: true,
    heroImages: [IMG[4], IMG[5], IMG[0]],
  }),
  makeProduct({
    id: 6,
    slug: "coastal-line",
    name: "Coastal Line",
    layout: "T Shape layout",
    layoutType: "T Shape",
    finish: "Matte lacquer",
    material: "Laminate",
    style: "Minimal",
    color: "White",
    image: IMG[5],
    heroImages: [IMG[5], IMG[1], IMG[2]],
  }),
  makeProduct({
    id: 7,
    slug: "amber-court",
    name: "Amber Court",
    layout: "Island layout",
    layoutType: "Islands",
    finish: "Natural oil",
    material: "Oak veneer",
    style: "Classic",
    color: "Oak",
    image: IMG[0],
  }),
  makeProduct({
    id: 8,
    slug: "nova-kitchen",
    name: "Nova Kitchen",
    layout: "Straight layout",
    layoutType: "Modern",
    finish: "Gloss lacquer",
    material: "Laminate",
    style: "Contemporary",
    color: "Grey",
    image: IMG[1],
    bestSeller: true,
  }),
  makeProduct({
    id: 9,
    slug: "heritage-wing",
    name: "Heritage Wing",
    layout: "U Shape layout",
    layoutType: "U Shape",
    finish: "Veneer",
    material: "Walnut",
    style: "Luxury",
    color: "Walnut",
    image: IMG[2],
  }),
  makeProduct({
    id: 10,
    slug: "calm-studio",
    name: "Calm Studio",
    layout: "L Shape layout",
    layoutType: "L Shape",
    finish: "Matte lacquer",
    material: "Oak veneer",
    style: "Minimal",
    color: "White",
    image: IMG[3],
  }),
  makeProduct({
    id: 11,
    slug: "shadow-ridge",
    name: "Shadow Ridge",
    layout: "Island layout",
    layoutType: "Islands",
    finish: "Matte lacquer",
    material: "Solid wood",
    style: "Contemporary",
    color: "Black",
    image: IMG[4],
    bestSeller: true,
  }),
  makeProduct({
    id: 12,
    slug: "linen-bay",
    name: "Linen Bay",
    layout: "Straight layout",
    layoutType: "Straight",
    finish: "Natural oil",
    material: "Oak veneer",
    style: "Classic",
    color: "Oak",
    image: IMG[5],
  }),
];

export const PRODUCTS_PER_PAGE = 6;

export function getProductBySlug(slug: string): ProductItem | undefined {
  return productItems.find((item) => item.slug === slug);
}
