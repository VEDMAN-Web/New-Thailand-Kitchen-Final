import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsPageView from "../../component/products/ProductsPageView";
import { fetchHomeSections, fetchMergedProducts } from "../../services/cmsPublic";
import { productItems } from "../../component/products/productData";
import { pickCmsText } from "../../lib/cmsText";
import { pageSeo, SITE_SEO_LOCALE } from "../../lib/pageMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRODUCTS_TITLE = "Kitchen Products | Thailand Kitchens";
const PRODUCTS_DESCRIPTION =
  "Browse custom Thai kitchen collections — layouts, finishes, and cabinetry designed for homes across Thailand.";

export async function generateMetadata(): Promise<Metadata> {
  const home = await fetchHomeSections().catch(() => ({}));
  const cms = (home as { productsPage?: Record<string, unknown> }).productsPage || {};
  const title = pickCmsText(cms.metaTitle, PRODUCTS_TITLE, SITE_SEO_LOCALE);
  const description = pickCmsText(
    cms.metaDescription,
    PRODUCTS_DESCRIPTION,
    SITE_SEO_LOCALE
  );
  return pageSeo({
    title: title.includes("Thailand Kitchens")
      ? title
      : `${title} | Thailand Kitchens`,
    description,
    path: "/products",
    image: typeof cms.ogImage === "string" ? cms.ogImage : undefined,
  });
}

export default async function Page() {
  const items = await fetchMergedProducts().catch(() => productItems);
  return (
    <main className="w-full">
      <Suspense fallback={<div className="min-h-[40vh] bg-[#F5F3EF]" />}>
        <ProductsPageView initialItems={items} />
      </Suspense>
    </main>
  );
}
