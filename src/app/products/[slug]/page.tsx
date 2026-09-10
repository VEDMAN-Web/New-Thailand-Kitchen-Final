import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailView from "../../../component/products/ProductDetailView";
import ProductsPageView from "../../../component/products/ProductsPageView";
import Breadcrumbs from "../../../components/seo/Breadcrumbs";
import JsonLd from "../../../components/seo/JsonLd";
import {
  productItems,
  collectProductFilterTabs,
  tabFromSlugValue,
  type ProductItem,
} from "../../../component/products/productData";
import {
  fetchMergedProducts,
  fetchMergedCategories,
  fetchProductBySlug,
} from "../../../services/cmsPublic";
import { pickCmsText } from "../../../lib/cmsText";
import { absoluteUrl, ogImageUrl } from "../../../lib/siteUrl";
import { getServerLocale } from "../../../lib/serverLocale";
import { seoAlternates, SITE_SEO_LOCALE } from "../../../lib/pageMetadata";

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
  const extras: string[] = [];

  try {
    const locale = await getServerLocale();
    const cats = await fetchMergedCategories();
    for (const cat of cats) {
      if (String(cat.categoryType || "") !== "layout") continue;
      const id = pickCmsText(cat.title, "", locale);
      if (id) extras.push(id);
    }
  } catch {
    /* fall through — canonical layouts + product tags still apply */
  }

  for (const p of items) {
    if (p.layout) extras.push(String(p.layout).trim());
    if (p.layoutType) extras.push(String(p.layoutType).trim());
  }

  return collectProductFilterTabs(extras);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const normalized = decodeURIComponent(slug)
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

  // Resolve real products first so product pages do not wait for category
  // discovery before their content and metadata can stream.
  const product = await fetchProductBySlug(normalized);
  if (product) {
    const title =
      product.metaTitle ||
      `${pickCmsText((product as any).title || product.name, "", SITE_SEO_LOCALE)} | Thailand Kitchens`;
    const description =
      product.metaDescription ||
      pickCmsText((product as any).description || "", "", SITE_SEO_LOCALE);
    const canonical = absoluteUrl(`/products/${product.slug}`);
    const image = ogImageUrl(product.image);

    const metadata: Metadata = {
      title,
      description,
      alternates: seoAlternates(`/products/${product.slug}`),
      openGraph: {
        type: "website",
        title,
        description,
        url: canonical,
        images: [{ url: image, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };

    if (product.indexable === false) {
      metadata.robots = { index: false, follow: true };
    }

    return metadata;
  }

  // Category metadata is only needed when the slug is not a product.
  const items = await fetchMergedProducts().catch(() => productItems);
  const knownTabs = await buildKnownCategoryTabs(items);
  const categoryTab = tabFromSlugValue(normalized, knownTabs);
  if (!categoryTab) return { title: "Product Not Found" };

  const tabTitle = `${categoryTab} Kitchens | Thailand Kitchens`;
  const tabDescription = `Browse our ${categoryTab} kitchen collection.`;
  const tabImage = ogImageUrl(items.find((p) => p.image)?.image);
  const tabUrl = absoluteUrl(`/products/${normalized}`);
  return {
    title: tabTitle,
    description: tabDescription,
    alternates: seoAlternates(`/products/${normalized}`),
    openGraph: {
      type: "website",
      title: tabTitle,
      description: tabDescription,
      url: tabUrl,
      images: [{ url: tabImage, width: 1200, height: 630, alt: tabTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: tabTitle,
      description: tabDescription,
      images: [tabImage],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const normalized = decodeURIComponent(slug)
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

  const locale = await getServerLocale();

  // STEP 1: Check if this is a real product in the database (highest priority)
  const product = await fetchProductBySlug(normalized);
  
  if (product) {
    const productTitle = pickCmsText((product as any).title || product.name, '', locale);
    const productDesc = pickCmsText((product as any).description || product.description, '', locale);

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
  
  const productName = pickCmsText((fromStatic as any).title || fromStatic.name, '', locale);
  const productDesc = pickCmsText((fromStatic as any).description || fromStatic.description, '', locale);
  
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
