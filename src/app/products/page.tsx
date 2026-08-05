import { Suspense } from "react";
import ProductsPageView from "../../component/products/ProductsPageView";
import { fetchMergedProducts } from "../../services/cmsPublic";
import { productItems } from "../../component/products/productData";

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
