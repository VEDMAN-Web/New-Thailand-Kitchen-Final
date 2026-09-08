import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsPageView from "../../component/products/ProductsPageView";
import { fetchMergedProducts } from "../../services/cmsPublic";
import { productItems } from "../../component/products/productData";
import { SITE_ORIGIN } from "../../lib/siteUrl";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRODUCTS_TITLE = "Kitchen Products | Thailand Kitchens";
const PRODUCTS_DESCRIPTION =
  "Browse our full collection of custom Thai kitchen products — cabinetry, layouts, finishes, and hardware crafted for every home.";
const PRODUCTS_URL = `${SITE_ORIGIN}/products`;

export const metadata: Metadata = {
  title: PRODUCTS_TITLE,
  description: PRODUCTS_DESCRIPTION,
  alternates: {
    canonical: PRODUCTS_URL,
  },
  openGraph: {
    type: "website",
    title: PRODUCTS_TITLE,
    description: PRODUCTS_DESCRIPTION,
    url: PRODUCTS_URL,
  },
};

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
