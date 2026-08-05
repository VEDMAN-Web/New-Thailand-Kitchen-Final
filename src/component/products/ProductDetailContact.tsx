import Image from "next/image";
import { ProductItem } from "./productData";
import ProductDetailContactForm from "./ProductDetailContactForm";

interface Props {
  product: ProductItem;
}

export default function ProductDetailContact({ product }: Props) {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
        Premium Finishes
      </p>
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1A1A1A] mb-10 lg:mb-14">
        Contact US
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
        <div className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
          <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-extrabold text-[#1A1A1A] leading-snug mb-8">
            Let&apos;s design a kitchen worthy of your island.
          </h3>
          <ProductDetailContactForm />
        </div>

        <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-full rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden">
          <Image
            src={product.contactImage}
            alt={`${product.name} kitchen interior`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
