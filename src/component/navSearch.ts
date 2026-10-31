import {
  fetchMergedBlogs,
  fetchMergedCatalogues,
  fetchMergedCategories,
  fetchMergedFaqs,
  fetchMergedGallery,
  fetchMergedProducts,
  type CmsCategory,
} from "../services/cmsPublic";
import { pickCmsText } from "../lib/cmsText";
import { categoryPublicPath, categorySectionLabel } from "../lib/categoryRoutes";
import { HUB_NAV_CONFIG, hubFallbackTitle } from "../lib/hubNavigation";
import { KITCHENS_SECTIONS, kitchensSectionLabel } from "../components/kitchens/kitchensConfig";
import type { Locale } from "../i18n/translations";
import { tx } from "../i18n/translations";
import { productItems } from "./products/productData";
import { blogPosts } from "./blog/blogData";
import { galleryItems } from "./gallery/galleryData";
import { products as catalogProducts } from "./catlog/catlogData";

export type NavSearchResult = {
  id: string;
  title: string;
  description: string;
  href: string;
  type: string;
  /** "page" = site pages/hubs; everything else = CMS content */
  group: "page" | "content";
};

export type GroupedNavSearch = {
  pages: NavSearchResult[];
  content: NavSearchResult[];
};

const TYPE_PAGE = "Page";

function staticPageItems(locale: Locale): NavSearchResult[] {
  const hubs: NavSearchResult[] = HUB_NAV_CONFIG.map((hub) => ({
    id: `page-hub-${hub.key}`,
    title: hubFallbackTitle(hub, locale),
    description: hub.fallbackDescription,
    href: hub.href,
    type: TYPE_PAGE,
    group: "page",
  }));

  const kitchenSubs: NavSearchResult[] = KITCHENS_SECTIONS.map((section) => ({
    id: `page-kitchens-${section.key}`,
    title: kitchensSectionLabel(section, locale),
    description: section.description,
    href: section.href,
    type: TYPE_PAGE,
    group: "page",
  }));

  const core: NavSearchResult[] = [
    {
      id: "page-home",
      title: tx(locale, "nav.home"),
      description: "Thailand Kitchens homepage — kitchens, catalogue and consultation.",
      href: "/",
      type: TYPE_PAGE,
      group: "page",
    },
    {
      id: "page-products",
      title: tx(locale, "nav.products"),
      description: "Browse modular kitchen layouts, finishes, materials and best sellers.",
      href: "/products",
      type: TYPE_PAGE,
      group: "page",
    },
    {
      id: "page-gallery",
      title: tx(locale, "nav.gallery"),
      description: "Inspiration library of tropical, modern and minimal kitchen designs.",
      href: "/gallery",
      type: TYPE_PAGE,
      group: "page",
    },
    {
      id: "page-guides",
      title: tx(locale, "nav.guides"),
      description: "Guides on craft, design and modern Thai kitchen living.",
      href: "/guides",
      type: TYPE_PAGE,
      group: "page",
    },
    {
      id: "page-contact",
      title: tx(locale, "nav.contact"),
      description: "Free design consultation — get in touch with our kitchen studio.",
      href: "/contact",
      type: TYPE_PAGE,
      group: "page",
    },
    {
      id: "page-faq",
      title: tx(locale, "nav.faq"),
      description: "Answers about pricing, process, materials, installation and support.",
      href: "/faq",
      type: TYPE_PAGE,
      group: "page",
    },
    {
      id: "page-catalogue",
      title: tx(locale, "footer.link.freeCatalogue"),
      description: "Download our latest kitchen catalogue PDF.",
      href: "/catalogue",
      type: TYPE_PAGE,
      group: "page",
    },
  ];

  return [...core, ...hubs, ...kitchenSubs];
}

function toProductHref(slug: string) {
  const clean = String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
  return clean ? `/products/${encodeURIComponent(clean)}` : "/products";
}

function textOf(value: unknown, locale: Locale, fallback = ""): string {
  return pickCmsText(value, fallback, locale).trim();
}

function buildIndexFromCms(
  data: {
    products: Awaited<ReturnType<typeof fetchMergedProducts>>;
    blogs: Awaited<ReturnType<typeof fetchMergedBlogs>>;
    gallery: Awaited<ReturnType<typeof fetchMergedGallery>>;
    catalogues: Awaited<ReturnType<typeof fetchMergedCatalogues>>;
    categories: CmsCategory[];
    faqs: Awaited<ReturnType<typeof fetchMergedFaqs>>;
  },
  locale: Locale,
): NavSearchResult[] {
  const products: NavSearchResult[] = data.products
    .map((p) => {
      const title = textOf(p.name, locale);
      if (!title) return null;
      return {
        id: `product-${p.id}`,
        title,
        description: [
          textOf(p.description, locale),
          textOf(p.headline, locale),
          textOf(p.layout, locale),
          textOf(p.style, locale),
          textOf(p.material, locale),
          textOf(p.finish, locale),
          textOf(p.color, locale),
          ...p.features.map(
            (f) =>
              `${textOf(f.title as unknown, locale)} ${textOf(f.description as unknown, locale)}`,
          ),
        ]
          .filter(Boolean)
          .join(" "),
        href: toProductHref(p.slug),
        type: "Product",
        group: "content" as const,
      };
    })
    .filter(Boolean) as NavSearchResult[];

  const blogs: NavSearchResult[] = data.blogs
    .map((b) => {
      const title = textOf(b.title, locale) || String(b.title || "").trim();
      if (!title) return null;
      return {
        id: `blog-${b.id}`,
        title,
        description: [
          textOf(b.excerpt, locale) || String(b.excerpt || ""),
          textOf(b.category as unknown, locale) || String(b.category || ""),
          String(b.filter || ""),
          ...(Array.isArray(b.content) ? b.content.map((c) => String(c || "")) : []),
        ]
          .filter(Boolean)
          .join(" "),
        href: `/guides/${b.slug}`,
        type: "Guide",
        group: "content" as const,
      };
    })
    .filter(Boolean) as NavSearchResult[];

  const gallery: NavSearchResult[] = data.gallery
    .map((g) => {
      const title = textOf(g.title, locale, "Gallery");
      return {
        id: `gallery-${g.id}`,
        title,
        description: `${String(g.filter || "")} kitchen gallery inspiration`.trim(),
        href: "/gallery",
        type: "Gallery",
        group: "content" as const,
      };
    })
    .filter((g) => g.title);

  const catalogues: NavSearchResult[] = data.catalogues.slice(0, 8).map((c) => {
    const category = textOf(c.category, locale, "Catalogue");
    const title = textOf(c.title, locale, "Catalogue");
    return {
      id: `catalog-${c.id}`,
      title: `${category} Catalogue`,
      description: `${title} — download our ${category.toLowerCase()} kitchen catalogue.`,
      href: "/catalogue",
      type: "Catalogue",
      group: "content" as const,
    };
  });

  const categories: NavSearchResult[] = data.categories
    .map((c) => {
      const title = textOf(c.title, locale);
      if (!title || !c.slug) return null;
      const typeLabel = categorySectionLabel(c.categoryType || "", locale);
      const desc =
        textOf(c.description, locale) ||
        textOf(c.metaDescription, locale) ||
        `${typeLabel} — ${title}`;
      return {
        id: `category-${c.id}`,
        title,
        description: desc,
        href: categoryPublicPath(c),
        type: typeLabel,
        group: "content" as const,
      };
    })
    .filter(Boolean) as NavSearchResult[];

  const faqs: NavSearchResult[] = data.faqs
    .map((f, i) => {
      const q = textOf(f.question, locale);
      const a = textOf(f.answer, locale);
      if (!q) return null;
      return {
        id: `faq-${f.id || i}`,
        title: q,
        description: a,
        href: "/faq",
        type: "FAQ",
        group: "content" as const,
      };
    })
    .filter(Boolean) as NavSearchResult[];

  return [
    ...staticPageItems(locale),
    ...categories,
    ...products,
    ...blogs,
    ...gallery,
    ...catalogues,
    ...faqs,
  ];
}

function buildStaticIndex(locale: Locale): NavSearchResult[] {
  return buildIndexFromCms(
    {
      products: productItems,
      blogs: blogPosts,
      gallery: galleryItems,
      catalogues: catalogProducts.map((p) => ({ ...p, pdfUrl: "" })),
      categories: [],
      faqs: [],
    },
    locale,
  );
}

const cacheByLocale = new Map<Locale, NavSearchResult[]>();
const loadByLocale = new Map<Locale, Promise<NavSearchResult[]>>();

export async function loadNavSearchIndex(locale: Locale = "EN"): Promise<NavSearchResult[]> {
  const cached = cacheByLocale.get(locale);
  if (cached) return cached;

  const inflight = loadByLocale.get(locale);
  if (inflight) return inflight;

  const promise = Promise.all([
    fetchMergedProducts().catch(() => [] as Awaited<ReturnType<typeof fetchMergedProducts>>),
    fetchMergedBlogs().catch(() => [] as Awaited<ReturnType<typeof fetchMergedBlogs>>),
    fetchMergedGallery().catch(() => [] as Awaited<ReturnType<typeof fetchMergedGallery>>),
    fetchMergedCatalogues().catch(() => [] as Awaited<ReturnType<typeof fetchMergedCatalogues>>),
    fetchMergedCategories().catch(() => [] as CmsCategory[]),
    fetchMergedFaqs().catch(() => [] as Awaited<ReturnType<typeof fetchMergedFaqs>>),
  ])
    .then(([products, blogs, gallery, catalogues, categories, faqs]) => {
      const hasCms =
        products.length +
          blogs.length +
          gallery.length +
          catalogues.length +
          categories.length +
          faqs.length >
        0;
      const index = hasCms
        ? buildIndexFromCms(
            { products, blogs, gallery, catalogues, categories, faqs },
            locale,
          )
        : buildStaticIndex(locale);
      cacheByLocale.set(locale, index);
      return index;
    })
    .catch(() => {
      const index = buildStaticIndex(locale);
      cacheByLocale.set(locale, index);
      return index;
    })
    .finally(() => {
      loadByLocale.delete(locale);
    });

  loadByLocale.set(locale, promise);
  return promise;
}

function scoreItem(item: NavSearchResult, terms: string[]): number {
  const title = item.title.toLowerCase();
  const desc = item.description.toLowerCase();
  const type = item.type.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (title === term) score += 100;
    else if (title.startsWith(term)) score += 60;
    else if (title.includes(term)) score += 40;
    if (type.includes(term)) score += 15;
    if (desc.includes(term)) score += 10;
  }
  if (item.group === "page") score += 5;
  return score;
}

export function searchSiteContent(
  query: string,
  limit = 10,
  index?: NavSearchResult[],
): NavSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const source = index?.length ? index : buildStaticIndex("EN");

  return source
    .map((item) => ({ item, score: scoreItem(item, terms) }))
    .filter(({ score, item }) => {
      if (score <= 0) return false;
      const haystack = `${item.title} ${item.description} ${item.type}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

/** Varsovia-style grouped results: pages first, then CMS content. */
export function searchSiteGrouped(
  query: string,
  index?: NavSearchResult[],
  limits: { pages?: number; content?: number } = {},
): GroupedNavSearch {
  const pageLimit = limits.pages ?? 5;
  const contentLimit = limits.content ?? 8;
  const all = searchSiteContent(query, pageLimit + contentLimit + 8, index);
  const pages = all.filter((r) => r.group === "page").slice(0, pageLimit);
  const pageHrefs = new Set(pages.map((p) => p.href.split("?")[0]));
  const content = all
    .filter((r) => r.group === "content" && !pageHrefs.has(r.href.split("?")[0]))
    .slice(0, contentLimit);
  return { pages, content };
}

/** Bust cache after admin publishes. */
export function invalidateNavSearchIndex() {
  cacheByLocale.clear();
  loadByLocale.clear();
}
