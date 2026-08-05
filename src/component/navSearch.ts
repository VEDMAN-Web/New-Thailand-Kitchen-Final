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

function buildSearchIndex(): NavSearchResult[] {
  const products: NavSearchResult[] = productItems.map((p) => ({
    id: `product-${p.id}`,
    title: p.name,
    description: [
      p.description,
      p.headline,
      p.layout,
      p.style,
      p.material,
      p.finish,
      p.color,
      ...p.features.map((f) => `${f.title} ${f.description}`),
    ].join(" "),
    href: toProductHref(p.slug),
    type: "Product",
  }));

  const blogs: NavSearchResult[] = blogPosts.map((b) => ({
    id: `blog-${b.id}`,
    title: b.title,
    description: [b.excerpt, b.category, b.filter, ...b.content].join(" "),
    href: `/blog/${b.slug}`,
    type: "Blog",
  }));

  const gallery: NavSearchResult[] = galleryItems.map((g) => ({
    id: `gallery-${g.id}`,
    title: g.title,
    description: `${g.filter} kitchen gallery inspiration`,
    href: "/gallery",
    type: "Gallery",
  }));

  const catalogues: NavSearchResult[] = catalogProducts.slice(0, 3).map((c) => ({
    id: `catalog-${c.id}`,
    title: `${c.category} Catalogue`,
    description: `${c.title} — download our ${c.category.toLowerCase()} kitchen catalogue.`,
    href: "/catalogue",
    type: "Catalogue",
  }));

  return [...pageItems, ...products, ...blogs, ...gallery, ...catalogues];
}

const SEARCH_INDEX = buildSearchIndex();

export function searchSiteContent(query: string, limit = 8): NavSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);

  return SEARCH_INDEX.filter((item) => {
    const haystack = `${item.title} ${item.description} ${item.type}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  }).slice(0, limit);
}
