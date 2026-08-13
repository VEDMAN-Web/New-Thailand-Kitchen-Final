import {
  productItems,
  type ProductItem,
  type ProductLayout,
} from "../component/products/productData";
import {
  blogPosts,
  type BlogPost,
  type BlogCategory,
} from "../component/blog/blogData";
import {
  pickBlogCoverImage,
  resolveCmsMediaUrl,
} from "../lib/cmsMedia";

const SITE_ID = "thailand-kitchen";

/** Static mocks only when dev explicitly opts in (CMS is source of truth in production). */
function allowStaticFallback(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_CMS_STATIC_FALLBACK === "1"
  );
}

function normalizeSlug(slug: string) {
  return String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

function cmsBase() {
  // Browser: same-origin rewrite → Express /api (works on localhost + LAN IP)
  if (typeof window !== "undefined") {
    return "/cms-api";
  }

  // Explicit CMS URL (must be absolute for Node fetch)
  const cms = process.env.NEXT_PUBLIC_CMS_API_URL?.trim();
  if (cms && !cms.startsWith("/")) {
    return cms.replace(/\/+$/, "") || "http://127.0.0.1:5000/api";
  }

  // BACKEND_URL is host only (e.g. http://127.0.0.1:5000) — append /api
  const backend = (
    process.env.BACKEND_URL?.trim() || "http://127.0.0.1:5000"
  ).replace(/\/+$/, "");
  if (/\/api$/i.test(backend)) return backend;
  return `${backend}/api`;
}

async function cmsFetch(path: string) {
  const base = cmsBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export type HomeSections = Record<string, any>;

type CmsProduct = {
  _id: string;
  title: string;
  slug: string;
  subtitle?: unknown;
  sectionTag?: unknown;
  description: string;
  image: string;
  icon?: string;
  gallery?: string[];
  contactImage?: string;
  contactEyebrow?: unknown;
  contactTitle?: unknown;
  contactFormTitle?: unknown;
  pdfUrl?: string;
  category: string;
  featured: boolean;
  featureHighlights?: { title?: string; description?: string }[];
  finish?: string;
  material?: string;
  style?: string;
  color?: string;
  metaTitle?: string;
  metaDescription?: string;
  indexable?: boolean;
};

type CmsBlogTranslation = {
  title?: string;
  excerpt?: string;
  category?: string;
  bodySections?: { title?: string; content?: string; image?: string }[];
  highlightTitle?: string;
  highlightText?: string;
  quote?: string;
  quoteAuthor?: string;
};

type CmsBlog = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  gallery?: string[];
  category?: string;
  author?: string;
  readTime?: string;
  publishDate?: string;
  bodySections?: { title?: string; content?: string; image?: string }[];
  highlightTitle?: string;
  highlightText?: string;
  quote?: string;
  quoteAuthor?: string;
  translations?: { th?: CmsBlogTranslation; pl?: CmsBlogTranslation };
  published: boolean;
  createdAt?: string;
  primaryCommercialPage?: string;
  locationTag?: string;
  serviceTag?: string;
  materialTag?: string;
  metaDescription?: string;
  reviewer?: string;
};

const LAYOUTS: ProductLayout[] = [
  "Modern",
  "Islands",
  "U Shape",
  "L Shape",
  "Straight",
  "T Shape",
];

/**
 * Normalize a layout/category value for comparison so that admin-entered
 * forms like "u-shape", "U_Shape", "u shape" or "U Shape" all resolve to
 * the same canonical key ("u-shape"). This fixes category filtering (and
 * SEO category URLs like /products/u-shape) not matching products whose
 * CMS category was saved as a hyphenated slug instead of the display label.
 */
function normalizeLayoutKey(value: string): string {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "-");
}

function mapLayout(category: string): ProductLayout {
  const target = normalizeLayoutKey(category);
  const match = LAYOUTS.find((l) => normalizeLayoutKey(l) === target);
  return match || "Modern";
}

function mapCmsProduct(p: CmsProduct, index: number): ProductItem {
  const template = productItems[0];
  const image = p.image || template.image;
  const galleryImages =
    p.gallery && p.gallery.length
      ? p.gallery
      : [image, image, image];
  const categoryEn =
    typeof p.category === "object" && p.category
      ? String((p.category as any).en || "")
      : String(p.category || "");
  const titleEn =
    typeof p.title === "object" && p.title
      ? String((p.title as any).en || (p.title as any).th || "")
      : String(p.title || "");
  const subtitleEn =
    typeof p.subtitle === "object" && p.subtitle
      ? String((p.subtitle as any).en || (p.subtitle as any).th || "").trim()
      : typeof p.subtitle === "string"
        ? p.subtitle.trim()
        : "";
  const sectionTagEn =
    typeof p.sectionTag === "object" && p.sectionTag
      ? String((p.sectionTag as any).en || (p.sectionTag as any).th || "").trim()
      : typeof p.sectionTag === "string"
        ? p.sectionTag.trim()
        : "";
  const layoutType = mapLayout(categoryEn);
  const heroImages: [string, string, string] = [
    galleryImages[0] || image,
    galleryImages[1] || galleryImages[0] || image,
    galleryImages[2] || galleryImages[1] || galleryImages[0] || image,
  ];
  const detailImages: string[] = galleryImages.length
    ? galleryImages
    : [image, image];
  const features =
    p.featureHighlights
      ?.map((f) => ({
        title: f.title as any,
        description: f.description as any,
      }))
      .filter((f) => {
        const t =
          typeof f.title === "string"
            ? f.title
            : String((f.title as any)?.en || "");
        const d =
          typeof f.description === "string"
            ? f.description
            : String((f.description as any)?.en || "");
        return Boolean(t || d);
      }) || [];

  const contactImage =
    String(p.contactImage || "").trim() || image;

  return {
    ...template,
    id: 10000 + index,
    slug: normalizeSlug(p.slug) || normalizeSlug(titleEn).replace(/\s+/g, "-"),
    name: p.title as any,
    layout: categoryEn || layoutType,
    layoutType,
    image,
    bestSeller: Boolean(p.featured),
    heroImages,
    // Narrative eyebrow: sectionTag, then category
    tag: (sectionTagEn ? (p.sectionTag as any) : null) || (p.category as any) || categoryEn || "Collection",
    // Narrative headline: subtitle, then title
    headline: (subtitleEn ? (p.subtitle as any) : null) || (p.title as any),
    description: (p.description as any) || template.description,
    gallery: galleryImages.map((img) => ({
      image: img,
      caption: titleEn,
    })),
    features: features.length ? (features as any) : template.features,
    detailImages,
    contactImage,
    contactEyebrow: p.contactEyebrow as any,
    contactTitle: p.contactTitle as any,
    contactFormTitle: p.contactFormTitle as any,
    pdfUrl: p.pdfUrl || "",
    icon: p.icon || "",
    finish: (p.finish as any) || template.finish,
    material: (p.material as any) || template.material,
    style: (p.style as any) || template.style,
    color: (p.color as any) || template.color,
    metaTitle: String(p.metaTitle || ""),
    metaDescription: String(p.metaDescription || ""),
    indexable: p.indexable === true,
  };
}

function sectionsToParagraphs(
  sections?: { title?: string; content?: string }[]
) {
  return (sections || [])
    .map((s) => [s.title, s.content].filter(Boolean).join("\n").trim())
    .filter(Boolean);
}

function mapBlogTranslation(value?: CmsBlogTranslation) {
  if (!value) return undefined;
  const content = sectionsToParagraphs(value.bodySections);
  const bodySections = (value.bodySections || [])
    .map((s) => ({
      title: String(s.title || "").trim(),
      content: String(s.content || "").trim(),
      image: String(s.image || "").trim(),
    }))
    .filter((s) => s.title || s.content || s.image);
  const translated = {
    title: value.title?.trim() || undefined,
    excerpt: value.excerpt?.trim() || undefined,
    category: value.category?.trim() || undefined,
    subsectionTitle: value.highlightTitle?.trim() || undefined,
    highlightText: value.highlightText?.trim() || undefined,
    quote: value.quote?.trim() || undefined,
    quoteAuthor: value.quoteAuthor?.trim() || undefined,
    content: content.length ? content : undefined,
    bodySections: bodySections.length ? bodySections : undefined,
  };
  return Object.values(translated).some(Boolean) ? translated : undefined;
}

function mapCmsBlog(b: CmsBlog, index: number): BlogPost {
  const fromSections = sectionsToParagraphs(b.bodySections);
  const paragraphs = fromSections.length
    ? fromSections
    : String(b.content || "")
        .split(/\n{2,}/)
        .map((s) => s.trim())
        .filter(Boolean);

  const dateSource = b.publishDate || b.createdAt;
  const date = dateSource
    ? new Date(dateSource)
        .toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase()
    : "RECENT";
  const dateISO = dateSource ? new Date(dateSource).toISOString() : undefined;

  // Mongoose timestamps (for "Published/Updated" rendering + JSON-LD dateModified).
  const updatedISO = (b as any).updatedAt
    ? new Date((b as any).updatedAt).toISOString()
    : undefined;

  const coverImage = pickBlogCoverImage(b);

  const gallery =
    b.gallery && b.gallery.length >= 2
      ? ([
          resolveCmsMediaUrl(b.gallery[0]) || coverImage,
          resolveCmsMediaUrl(b.gallery[1]) || coverImage,
        ] as [string, string])
      : ([
          coverImage,
          resolveCmsMediaUrl(b.gallery?.[0]) || coverImage,
        ] as [string, string]);

  return {
    id: 20000 + index,
    slug: normalizeSlug(b.slug) || normalizeSlug(b.title).replace(/\s+/g, "-"),
    title: b.title,
    excerpt: b.excerpt || paragraphs[0] || "",
    category: b.category || "Journal",
    filter: "All" as BlogCategory,
    date,
    dateISO,
    updatedISO,
    readTime: (b.readTime || "5 MIN READ").toUpperCase().includes("MIN")
      ? (b.readTime || "5 MIN READ").toUpperCase()
      : `${b.readTime || "5"} MIN READ`,
    image: coverImage,
    gallery,
    featured: index === 0,
    subsectionTitle: b.highlightTitle || undefined,
    highlightText: b.highlightText || undefined,
    quote: b.quote || undefined,
    quoteAuthor: b.quoteAuthor || undefined,
    content: paragraphs.length
      ? paragraphs
      : [b.highlightText || b.excerpt || b.title],
    bodySections: (b.bodySections || [])
      .map((s) => ({
        title: String(s.title || "").trim(),
        content: String(s.content || "").trim(),
        image: resolveCmsMediaUrl(s.image),
      }))
      .filter((s) => s.title || s.content || s.image),
    translations: {
      th: mapBlogTranslation(b.translations?.th),
      pl: mapBlogTranslation(b.translations?.pl),
    },
    author: b.author || undefined,
    primaryCommercialPage: b.primaryCommercialPage || undefined,
    locationTag: b.locationTag || undefined,
    serviceTag: b.serviceTag || undefined,
    materialTag: b.materialTag || undefined,
    metaDescription: b.metaDescription || undefined,
    reviewer: b.reviewer || undefined,
    published: b.published !== false,
  };
}

/** Home CMS sections from admin panel */
export async function fetchHomeSections(): Promise<HomeSections> {
  const json = (await cmsFetch(`/cms/${SITE_ID}/home`)) as
    | { home?: { sections?: HomeSections } }
    | null;
  return json?.home?.sections || {};
}

/**
 * Products: CMS is the source of truth (admin panel).
 * Seeded defaults live in Mongo via listProducts ensureDefaultProducts.
 * Static productItems only used when API is unreachable.
 */
export async function fetchMergedProducts(): Promise<ProductItem[]> {
  try {
    const json = (await cmsFetch(`/cms/${SITE_ID}/products`)) as
      | { items?: CmsProduct[] }
      | null;
    if (!json) return allowStaticFallback() ? productItems : [];
    const cmsItems = (json.items || []).map(mapCmsProduct);
    if (!cmsItems.length) return allowStaticFallback() ? productItems : [];
    return cmsItems;
  } catch {
    return allowStaticFallback() ? productItems : [];
  }
}

export async function fetchMergedBlogs(): Promise<BlogPost[]> {
  try {
    const json = (await cmsFetch(`/cms/${SITE_ID}/blogs`)) as
      | { items?: CmsBlog[] }
      | null;
    if (!json) return allowStaticFallback() ? blogPosts : [];
    const cmsItems = (json.items || [])
      .filter((b) => b.published !== false)
      .map(mapCmsBlog);
    if (!cmsItems.length) return allowStaticFallback() ? blogPosts : [];
    return cmsItems;
  } catch {
    return allowStaticFallback() ? blogPosts : [];
  }
}

export async function fetchProductBySlug(
  slug: string
): Promise<ProductItem | undefined> {
  const target = normalizeSlug(slug);
  const all = await fetchMergedProducts();
  return all.find((p) => normalizeSlug(p.slug) === target);
}

export async function fetchBlogBySlug(
  slug: string
): Promise<BlogPost | undefined> {
  const target = normalizeSlug(slug);
  const all = await fetchMergedBlogs();
  return all.find((b) => normalizeSlug(b.slug) === target);
}

export type CmsCatalogue = {
  id: number;
  /** Localized map or legacy string — always resolve with pickCmsText before render */
  category: unknown;
  title: unknown;
  image: string;
  pdf: string;
  pdfUrl?: string;
  downloadName: string;
};

export async function fetchMergedCatalogues(): Promise<CmsCatalogue[]> {
  const { products } = await import("../component/catlog/catlogData");
  const home = await fetchHomeSections();

  // Prefer Home Management → Free Catalogue (admin source of truth),
  // including an empty list after all items are removed.
  if (home && Array.isArray(home.catalogue?.items)) {
    return (home.catalogue.items as any[]).map((c, index) => ({
      id: 31000 + index,
      category: c.category ?? "Catalogue",
      title: c.title ?? "Catalogue",
      image: String(c.image || "/catlog/catlog.png"),
      pdf: String(c.fileName || ""),
      pdfUrl: String(c.pdfUrl || ""),
      downloadName: String(c.downloadName || c.fileName || "catalogue.pdf"),
    }));
  }

  const dedicated = (await cmsFetch(`/cms/${SITE_ID}/catalogues`)) as
    | { items?: any[] }
    | null;

  const fromDedicated = (dedicated?.items || []).map((c, index) => ({
    id: 30000 + index,
    category: c.category ?? "Catalogue",
    title: c.title ?? "Catalogue",
    image: String(c.image || "/catlog/catlog.png"),
    pdf: String(c.fileName || ""),
    pdfUrl: String(c.pdfUrl || ""),
    downloadName: String(c.downloadName || c.fileName || "catalogue.pdf"),
  }));

  if (fromDedicated.length) return fromDedicated;

  return products.map((p) => ({
    ...p,
    pdfUrl: "",
  }));
}

export type CmsFaq = {
  id: number | string;
  /** Localized map or legacy string */
  question: unknown;
  answer: unknown;
};

export async function fetchMergedFaqs(): Promise<CmsFaq[]> {
  // Dedicated FAQs are the source of truth (admin /faqs).
  const dedicated = (await cmsFetch(`/cms/${SITE_ID}/faqs`)) as
    | { items?: any[] }
    | null;
  const fromDedicated = (dedicated?.items || []).map((f, index) => ({
    id: f._id || 40000 + index,
    question: f.question || "",
    answer: f.answer || "",
  }));
  if (fromDedicated.length) return fromDedicated;

  // Fallback: home FAQ section, then empty (FaqSection uses static faqData).
  const home = await fetchHomeSections();
  const homeItems = (home?.faq?.items || []) as any[];
  if (homeItems.length) {
    return homeItems.map((f, index) => ({
      id: 41000 + index,
      question: f.question || "",
      answer: f.answer || "",
    }));
  }
  return [];
}

export type CmsCategory = {
  id: string;
  /** Localized map `{en,th,pl}` or legacy string */
  title: unknown;
  description: unknown;
  image: string;
  slug?: string;
  categoryType?: string;
  parentId?: string | CmsCategory;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  indexable?: boolean;
  sections?: { heading?: unknown; body?: unknown; image?: string; layout?: string }[];
  eyebrow?: unknown;
  ctaLabel?: unknown;
  ctaHref?: string;
  footerCtaHeading?: unknown;
  footerCtaBody?: unknown;
};

function mapCategoryFromApi(c: Record<string, unknown>): CmsCategory {
  return {
    id: String(c._id || localizedEn(c.title) || ""),
    title: c.title,
    description: c.description,
    image: String(c.image || ""),
    slug: c.slug as string | undefined,
    categoryType: c.categoryType as string | undefined,
    parentId: c.parentId as string | CmsCategory | undefined,
    metaTitle: c.metaTitle as string | undefined,
    metaDescription: c.metaDescription as string | undefined,
    canonicalUrl: c.canonicalUrl as string | undefined,
    indexable: c.indexable as boolean | undefined,
    sections: Array.isArray(c.sections) ? c.sections : [],
    eyebrow: c.eyebrow,
    ctaLabel: c.ctaLabel,
    ctaHref: String(c.ctaHref || "/contact").trim() || "/contact",
    footerCtaHeading: c.footerCtaHeading,
    footerCtaBody: c.footerCtaBody,
  };
}

function localizedEn(value: unknown): string {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const map = value as { en?: unknown; th?: unknown; pl?: unknown };
    return String(map.en || map.th || map.pl || "").trim();
  }
  return typeof value === "string" ? value.trim() : "";
}

export async function fetchMergedCategories(): Promise<CmsCategory[]> {
  const json = (await cmsFetch(`/cms/${SITE_ID}/categories`)) as
    | { items?: any[] }
    | null;
  return (json?.items || [])
    .map((c) => mapCategoryFromApi(c))
    .filter((c) => localizedEn(c.title));
}

/** Get category by slug with optional type filter */
export type CategoryTypeFilter =
  | "service"
  | "material"
  | "style"
  | "layout"
  | "property-type"
  | "location"
  | "built-in-furniture"
  | string;

export async function getCategoryBySlug(
  slug: string,
  type?: CategoryTypeFilter
): Promise<CmsCategory | null> {
  const params = type ? `?type=${encodeURIComponent(type)}` : "";
  const json = (await cmsFetch(
    `/cms/${SITE_ID}/categories/by-slug/${slug}${params}`
  )) as { category?: any; item?: any } | null;
  // Backend returns `item`; accept `category` too for forward/backward compatibility
  const c = json?.item || json?.category;
  if (!c) return null;
  return mapCategoryFromApi(c);
}

/**
 * Resolve a location × service category:
 * service slug + parent location slug must match.
 */
export async function getLocationServiceCategory(
  locationSlug: string,
  serviceSlug: string
): Promise<CmsCategory | null> {
  const loc = normalizeSlug(locationSlug);
  const svc = normalizeSlug(serviceSlug);
  const json = (await cmsFetch(
    `/cms/${SITE_ID}/categories/by-slug/${encodeURIComponent(svc)}?type=service&parentLocation=${encodeURIComponent(loc)}`
  )) as { category?: any; item?: any } | null;
  const c = json?.item || json?.category;
  if (!c) return null;
  return mapCategoryFromApi(c);
}

/** Get all indexable categories for sitemap */
export async function getIndexableCategories(): Promise<CmsCategory[]> {
  const json = (await cmsFetch(`/cms/${SITE_ID}/categories?indexable=true`)) as
    | { items?: any[] }
    | null;
  return (json?.items || []).map((c) => mapCategoryFromApi(c));
}

/** Get all indexable products for sitemap */
export async function getIndexableProducts(): Promise<ProductItem[]> {
  const all = await fetchMergedProducts();
  return all.filter((p) => (p as any).indexable === true);
}

/** Get products filtered by category slug */
export async function getProductsByCategory(
  categorySlug: string
): Promise<ProductItem[]> {
  const all = await fetchMergedProducts();
  const target = normalizeSlug(categorySlug);
  const targetKey = normalizeLayoutKey(categorySlug);
  const known = new Set(
    LAYOUTS.map((l) => normalizeLayoutKey(l))
  );

  return all.filter((p) => {
    const layoutKey = normalizeLayoutKey(String(p.layout || ""));
    const typeKey = normalizeLayoutKey(String(p.layoutType || ""));
    const categoryKey = normalizeSlug(String((p as any).category || ""));
    const isCustom = Boolean(layoutKey && !known.has(layoutKey));

    if (isCustom) {
      return (
        layoutKey === targetKey ||
        normalizeSlug(String(p.layout || "")) === target ||
        categoryKey === target
      );
    }

    return (
      layoutKey === targetKey ||
      typeKey === targetKey ||
      normalizeSlug(String(p.layout || "")) === target ||
      categoryKey === target
    );
  });
}

export type CmsGallery = {
  id: number | string;
  image: string;
  /** Localized map `{en,th,pl}` or legacy string */
  title: unknown;
  filter: string;
  tall?: boolean;
  wide?: boolean;
  sortOrder?: number;
  locationTag?: string;
  layoutTag?: string;
  styleTag?: string;
  materialTag?: string;
  propertyType?: string;
  projectTitle?: string;
  projectDesc?: string;
};

export async function fetchMergedGallery(): Promise<CmsGallery[]> {
  const { galleryItems } = await import("../component/gallery/galleryData");
  const json = (await cmsFetch(`/cms/${SITE_ID}/gallery`)) as
    | { items?: any[] }
    | null;
  const cmsItems = (json?.items || []).map((g, index) => ({
    id: g._id || 50000 + index,
    image: g.image || "",
    title: g.title || "Gallery",
    filter: g.filter || "Style & Color",
    tall: Boolean(g.tall),
    wide: Boolean(g.wide),
    sortOrder: Number(g.sortOrder) || 0,
    locationTag: String(g.locationTag || ""),
    layoutTag: String(g.layoutTag || ""),
    styleTag: String(g.styleTag || ""),
    materialTag: String(g.materialTag || ""),
    propertyType: String(g.propertyType || ""),
    projectTitle: String(g.projectTitle || ""),
    projectDesc: String(g.projectDesc || ""),
  }));
  if (cmsItems.length) return cmsItems;
  return allowStaticFallback() ? galleryItems : [];
}

function tagMatches(value: string, needle: string) {
  const a = normalizeLayoutKey(value);
  const b = normalizeLayoutKey(needle);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

/** Gallery items tagged for a commercial category page (no mocks). */
export async function getRelatedGalleryProjects(
  categoryType: string,
  category: { slug: string; title: string; locationSlug?: string },
  limit = 6
): Promise<CmsGallery[]> {
  const all = await fetchMergedGallery().catch(() => [] as CmsGallery[]);
  const needles = [category.slug, category.title, category.locationSlug || ""].filter(
    Boolean
  );

  const matched = all.filter((g) => {
    const fields: string[] = [];
    if (categoryType === "location") fields.push(g.locationTag || "");
    else if (categoryType === "layout") fields.push(g.layoutTag || "");
    else if (categoryType === "style") fields.push(g.styleTag || "");
    else if (categoryType === "material") fields.push(g.materialTag || "");
    else if (categoryType === "property-type") fields.push(g.propertyType || "");
    else if (categoryType === "service") {
      fields.push(g.locationTag || "", g.layoutTag || "", g.styleTag || "");
    } else if (categoryType === "built-in-furniture") {
      fields.push(g.propertyType || "", g.styleTag || "", g.layoutTag || "");
    } else {
      fields.push(
        g.locationTag || "",
        g.layoutTag || "",
        g.styleTag || "",
        g.materialTag || "",
        g.propertyType || ""
      );
    }
    return fields.some((f) => needles.some((n) => tagMatches(f, n)));
  });

  return matched.filter((g) => g.image).slice(0, limit);
}

export async function fetchLegalPage(type: "privacy" | "terms") {
  const json = (await cmsFetch(`/cms/${SITE_ID}/legal/${type}`)) as
    | {
        page?: {
          title?: unknown;
          subtitle?: unknown;
          updatedLabel?: unknown;
          content?: unknown;
          sections?: { title?: unknown; body?: unknown }[];
        };
      }
    | null;
  return json?.page || null;
}
