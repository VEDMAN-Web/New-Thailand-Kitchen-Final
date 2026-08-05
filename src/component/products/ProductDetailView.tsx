import { ProductItem } from "./productData";
import ProductDetailHero from "./ProductDetailHero";
import ProductDetailNarrative from "./ProductDetailNarrative";
import ProductDetailGallery from "./ProductDetailGallery";
import ProductDetailFeatures from "./ProductDetailFeatures";
import ProductDetailContact from "./ProductDetailContact";
import Footer from "../Footer/footer";

interface Props {
  product: ProductItem;
}

export default function ProductDetailView({ product }: Props) {
  return (
    <div className="w-full bg-[#F5F3EF]">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <ProductDetailHero product={product} />
        <ProductDetailNarrative product={product} />
        <ProductDetailGallery product={product} />
        <ProductDetailFeatures product={product} />
        <ProductDetailContact product={product} />
      </div>
      <Footer />
    </div>
  );
}
