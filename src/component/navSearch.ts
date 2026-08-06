import {
  fetchMergedBlogs,
  fetchMergedCatalogues,
  fetchMergedGallery,
  fetchMergedProducts,
} from "../services/cmsPublic";
import { pickCmsText } from "../lib/cmsText";
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
};

const pageItems: NavSearchResult[] = [
  {
    id: "page-home",
    title: "Home",
    description: "Thailand Kitchens homepage — kitchens, catalogue and consultation.",
    href: "/",
    type: "Page",
  },
  {
    id: "page-products",
    title: "Products",
    description: "Browse modular kitchen layouts, finishes, materials and best sellers.",
    href: "/products",
    type: "Page",
  },
  {
    id: "page-gallery",
    title: "Gallery",
    description: "Inspiration library of tropical, modern and minimal kitchen designs.",
    href: "/gallery",
    type: "Page",
  },
  {
    id: "page-blog",
    title: "Blog",
    description: "Stories of craft, design and modern Thai kitchen living.",
    href: "/blog",
    type: "Page",
  },
  {
    id: "page-contact",
    title: "Contact",
    description: "Free design consultation — get in touch with our kitchen studio.",
    href: "/contact",
    type: "Page",
  },
  {
    id: "page-faq",
    title: "FAQ",
    description: "Answers about pricing, process, materials, installation and support.",
    href: "/faq",
    type: "Page",
  },
  {
    id: "page-catalogue",
    title: "Free Catalogue",
    description: "Download our latest kitchen catalogue PDF.",
    href: "/catalogue",
    type: "Page",
  },
];

function toProductHref(slug: string) {
  const clean = String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
  return clean ? `/products/${encodeURIComponent(clean)}` : "/products";
}

function buildIndexFromCms(data: {
  products: Awaited<ReturnType<typeof fetchMergedProducts>>;
  blogs: Awaited<ReturnType<typeof fetchMergedBlogs>>;
  gallery: Awaited<ReturnType<typeof fetchMergedGallery>>;
  catalogues: Awaited<ReturnType<typeof fetchMergedCatalogues>>;
}): NavSearchResult[] {
  const products: NavSearchResult[] = data.products.map((p) => ({
    id: `product-${p.id}`,
    title: pickCmsText(p.name, "", "EN"),
    description: [
      pickCmsText(p.description, "", "EN"),
      pickCmsText(p.headline, "", "EN"),
      pickCmsText(p.layout, "", "EN"),
      pickCmsText(p.style, "", "EN"),
      pickCmsText(p.material, "", "EN"),
      pickCmsText(p.finish, "", "EN"),
      pickCmsText(p.color, "", "EN"),
      ...p.features.map(
        (f) =>
          `${pickCmsText(f.title as unknown, "", "EN")} ${pickCmsText(f.description as unknown, "", "EN")}`
      ),
    ].join(" "),
    href: toProductHref(p.slug),
    type: "Product",
  }));

  const blogs: NavSearchResult[] = data.blogs.map((b) => ({
    id: `blog-${b.id}`,
    title: b.title,
    description: [b.excerpt, b.category, b.filter, ...b.content].join(" "),
    href: `/blog/${b.slug}`,
    type: "Blog",
  }));

  const gallery: NavSearchResult[] = data.gallery.map((g) => ({
    id: `gallery-${g.id}`,
    title: pickCmsText(g.title, "Gallery", "EN"),
    description: `${g.filter} kitchen gallery inspiration`,
    href: "/gallery",
    type: "Gallery",
  }));

  const catalogues: NavSearchResult[] = data.catalogues.slice(0, 6).map((c) => {
    const category = pickCmsText(c.category, "Catalogue", "EN");
    const title = pickCmsText(c.title, "Catalogue", "EN");
    return {
      id: `catalog-${c.id}`,
      title: `${category} Catalogue`,
      description: `${title} — download our ${category.toLowerCase()} kitchen catalogue.`,
      href: "/catalogue",
      type: "Catalogue",
    };
  });

  return [...pageItems, ...products, ...blogs, ...gallery, ...catalogues];
}

/** Sync fallback if CMS has not loaded yet */
function buildStaticIndex(): NavSearchResult[] {
  return buildIndexFromCms({
    products: productItems,
    blogs: blogPosts,
    gallery: galleryItems,
    catalogues: catalogProducts.map((p) => ({ ...p, pdfUrl: "" })),
  });
}

let cachedIndex: NavSearchResult[] | null = null;
let loadPromise: Promise<NavSearchResult[]> | null = null;

export async function loadNavSearchIndex(): Promise<NavSearchResult[]> {
  if (cachedIndex) return cachedIndex;
  if (loadPromise) return loadPromise;

  loadPromise = Promise.all([
    fetchMergedProducts(),
    fetchMergedBlogs(),
    fetchMergedGallery(),
    fetchMergedCatalogues(),
  ])
    .then(([products, blogs, gallery, catalogues]) => {
      cachedIndex = buildIndexFromCms({ products, blogs, gallery, catalogues });
      return cachedIndex;
    })
    .catch(() => {
      cachedIndex = buildStaticIndex();
      return cachedIndex;
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

export function searchSiteContent(
  query: string,
  limit = 8,
  index?: NavSearchResult[]
): NavSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const source = index?.length ? index : cachedIndex || buildStaticIndex();

  return source
    .filter((item) => {
      const haystack = `${item.title} ${item.description} ${item.type}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    })
    .slice(0, limit);
}

/** Bust cache after admin publishes (optional future hook). */
export function invalidateNavSearchIndex() {
  cachedIndex = null;
}
