import ProductsHero from "./ProductsHero";
import ProductsListSection from "./ProductsListSection";
import Footer from "../Footer/footer";
import type { ProductItem } from "./productData";

export default function ProductsPageView({
  initialItems,
  initialCategory,
}: {
  initialItems: ProductItem[];
  /** Category tab to pre-select when this view was reached via a
   *  category URL like /products/u-shape (Smart merged route). */
  initialCategory?: string;
}) {
  return (
    <div className="w-full bg-[#F5F3EF]">
      <ProductsHero />
      <div className="max-w-6xl mx-auto px-6">
        <ProductsListSection
          initialItems={initialItems}
          initialCategory={initialCategory}
        />
      </div>
      <Footer />
    </div>
  );
}
