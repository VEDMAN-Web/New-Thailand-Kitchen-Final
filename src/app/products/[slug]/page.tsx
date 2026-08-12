import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailView from "../../../component/products/ProductDetailView";
import ProductsPageView from "../../../component/products/ProductsPageView";
import Breadcrumbs from "../../../components/seo/Breadcrumbs";
import JsonLd from "../../../components/seo/JsonLd";
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
import { absoluteUrl } from "../../../lib/siteUrl";

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

  // Individual product metadata with SEO fields
  const product = await fetchProductBySlug(normalized);
  if (!product) {
    return { title: 'Product Not Found' };
  }

  const title =
    product.metaTitle ||
    `${pickCmsText((product as any).title || product.name, "", "EN")} | Thailand Kitchens`;
  const description =
    product.metaDescription ||
    pickCmsText((product as any).description || "", "", "EN");

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/products/${product.slug}`),
    },
  };

  if (product.indexable === false) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const normalized = decodeURIComponent(slug)
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

  // STEP 1: Check if this is a real product in the database (highest priority)
  const product = await fetchProductBySlug(normalized);
  
  if (product) {
    const productTitle = pickCmsText((product as any).title || product.name, '', 'EN');
    const productDesc = pickCmsText((product as any).description || product.description, '', 'EN');

    return (
      <main className="w-full">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
          ]}
          currentPage={productTitle}
          currentHref={`/products/${product.slug}`}
        />
        <JsonLd
          type="Product"
          data={{
            name: productTitle,
            description: productDesc,
            image: product.image || '',
            brand: 'Thailand Kitchens',
          }}
        />
        <ProductDetailView product={product} />
      </main>
    );
  }

  // STEP 2: Not a database product - check if it's a category tab
  const items = await fetchMergedProducts().catch(() => productItems);
  const knownTabs = await buildKnownCategoryTabs(items);
  const categoryTab = tabFromSlugValue(normalized, knownTabs);

  if (categoryTab) {
    return (
      <main className="w-full">
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }]}
          currentPage={`${categoryTab} Kitchens`}
          currentHref={`/products/${normalized}`}
        />
        <ProductsPageView initialItems={items} initialCategory={categoryTab} />
      </main>
    );
  }

  // STEP 3: Fallback to static product data
  const fromStatic = productItems.find(
    (p) => p.slug.trim().replace(/^\/+|\/+$/g, "").toLowerCase() === normalized
  );
  if (!fromStatic) notFound();
  
  const productName = pickCmsText((fromStatic as any).title || fromStatic.name, '', 'EN');
  const productDesc = pickCmsText((fromStatic as any).description || fromStatic.description, '', 'EN');
  
  return (
    <main className="w-full">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
        ]}
        currentPage={productName}
        currentHref={`/products/${fromStatic.slug}`}
      />
      <JsonLd
        type="Product"
        data={{
          name: productName,
          description: productDesc,
          image: fromStatic.image || '',
          brand: 'Thailand Kitchens',
        }}
      />
      <ProductDetailView product={fromStatic} />
    </main>
  );
}
