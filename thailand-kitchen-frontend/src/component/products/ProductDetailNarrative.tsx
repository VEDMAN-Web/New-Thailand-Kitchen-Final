import { ProductItem } from "./productData";

interface Props {
  product: ProductItem;
}

export default function ProductDetailNarrative({ product }: Props) {
  return (
    <section className="pt-14 sm:pt-16 lg:pt-20 max-w-4xl">
      <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-semibold mb-4">
        {product.tag}
      </p>
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-[#1A1A1A] leading-tight">
        {product.headline}
      </h2>
      <p className="mt-5 sm:mt-6 text-[#5A5A5A] text-sm sm:text-base leading-7 sm:leading-8 max-w-3xl">
        {product.description}
      </p>
    </section>
  );
}
