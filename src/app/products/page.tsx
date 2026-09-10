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

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Parse ?page= from searchParams. Returns a valid integer ≥ 1, defaulting to 1. */
function parsePageParam(
  searchParams: Record<string, string | string[] | undefined>
): number {
  const raw = searchParams["page"];
  const str = Array.isArray(raw) ? raw[0] : raw;
  const n = str ? parseInt(str, 10) : NaN;
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const page = parsePageParam(params);
  // Page 1 canonical is /products (no query string).
  // Page N (N≥2) canonical is /products?page=N so each page is addressable.
  const canonical =
    page <= 1 ? PRODUCTS_URL : `${PRODUCTS_URL}?page=${page}`;

  return {
    title: PRODUCTS_TITLE,
    description: PRODUCTS_DESCRIPTION,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      title: PRODUCTS_TITLE,
      description: PRODUCTS_DESCRIPTION,
      url: canonical,
    },
  };
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const initialPage = parsePageParam(params);
  const items = await fetchMergedProducts().catch(() => productItems);
  return (
    <main className="w-full">
      <Suspense fallback={<div className="min-h-[40vh] bg-[#F5F3EF]" />}>
        <ProductsPageView initialItems={items} initialPage={initialPage} />
      </Suspense>
    </main>
  );
}
