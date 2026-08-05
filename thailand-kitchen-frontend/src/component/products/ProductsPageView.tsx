import ProductsHero from "./ProductsHero";
import ProductsListSection from "./ProductsListSection";
import Footer from "../Footer/footer";
import type { ProductItem } from "./productData";

export default function ProductsPageView({ initialItems }: { initialItems: ProductItem[] }) {
  return (
    <div className="w-full bg-[#F5F3EF]">
      <ProductsHero />
      <div className="max-w-6xl mx-auto px-6">
        <ProductsListSection initialItems={initialItems} />
      </div>
      <Footer />
    </div>
  );
}
