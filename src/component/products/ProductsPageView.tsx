import ProductsHero from "./ProductsHero";
import ProductsListSection from "./ProductsListSection";
import type { ProductItem } from "./productData";

export default function ProductsPageView({
  initialItems,
  initialCategory,
  initialPage,
}: {
  initialItems: ProductItem[];
  /** Category tab to pre-select when this view was reached via a
   *  category URL like /products/u-shape (Smart merged route). */
  initialCategory?: string;
  /** Page number to pre-select, sourced from the ?page= query param. */
  initialPage?: number;
}) {
  return (
    <div className="w-full bg-[#F5F3EF]">
      <ProductsHero />
      <div className="max-w-6xl mx-auto px-6">
        <ProductsListSection
          initialItems={initialItems}
          initialCategory={initialCategory}
          initialPage={initialPage}
        />
      </div>
    </div>
  );
}
