import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailView from "../../../component/products/ProductDetailView";
import ProductsPageView from "../../../component/products/ProductsPageView";
import {
  productItems,
  productFilterTabs,
  tabFromSlugValue,
  type ProductItem,
} from "../../../component/products/productData";
import {
  fetchMergedProducts,
  fetchMergedCategories,
  fetchProductBySlug,
} from "../../../services/cmsPublic";
import { pickCmsText } from "../../../lib/cmsText";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Build the same set of category tabs shown on /products (static tabs +
 * CMS categories + product-derived tags), so /products/<slug> can tell
 * whether a slug is a CATEGORY url (e.g. /products/u-shape) rather than
 * an individual product detail page. Mirrors the logic in
 * ProductsListSection.tsx so both stay in sync.
 */
async function buildKnownCategoryTabs(items: ProductItem[]): Promise<string[]> {
  const base = [...productFilterTabs] as string[];
  const known = new Set(base.map((t) => t.toLowerCase()));

  try {
    const cats = await fetchMergedCategories();
    for (const cat of cats) {
      const id = pickCmsText(cat.title, "", "EN");
      if (id && !known.has(id.toLowerCase())) {
        base.splice(base.length - 1, 0, id);
        known.add(id.toLowerCase());
      }
    }
  } catch {
    // ignore — fall back to static tabs + product-derived tags below
  }

  for (const p of items) {
    const cat = (p.layout || p.layoutType || "").trim();
    if (
      cat &&
      !known.has(cat.toLowerCase()) &&
      cat.toLowerCase() !== "modern" &&
      cat.toLowerCase() !== "all"
    ) {
      base.splice(base.length - 1, 0, cat);
      known.add(cat.toLowerCase());
    }
  }

  return base;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const normalized = decodeURIComponent(slug)
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

  const items = await fetchMergedProducts().catch(() => productItems);
  const knownTabs = await buildKnownCategoryTabs(items);
  const categoryTab = tabFromSlugValue(normalized, knownTabs);

  if (categoryTab) {
    return {
      title: `${categoryTab} Kitchens | Thailand Kitchens`,
      description: `Browse our ${categoryTab} kitchen collection.`,
    };
  }

  return {};
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const normalized = decodeURIComponent(slug)
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

  // First, check whether this slug is actually a product CATEGORY
  // (e.g. /products/u-shape, /products/l-shape) rather than an
  // individual product detail page. If so, render the category listing.
  const items = await fetchMergedProducts().catch(() => productItems);
  const knownTabs = await buildKnownCategoryTabs(items);
  const categoryTab = tabFromSlugValue(normalized, knownTabs);

  if (categoryTab) {
    return (
      <main className="w-full">
        <ProductsPageView initialItems={items} initialCategory={categoryTab} />
      </main>
    );
  }

  // Not a category — fall back to the existing individual product lookup.
  const product = await fetchProductBySlug(normalized);

  if (!product) {
    const fromStatic = productItems.find(
      (p) => p.slug.trim().replace(/^\/+|\/+$/g, "").toLowerCase() === normalized
    );
    if (!fromStatic) notFound();
    return (
      <main className="w-full">
        <ProductDetailView product={fromStatic} />
      </main>
    );
  }

  return (
    <main className="w-full">
      <ProductDetailView product={product} />
    </main>
  );
}
