import Image from "next/image";
import Link from "next/link";
import { ProductItem } from "./productData";

interface Props {
  product: ProductItem;
}

export default function ProductDetailHero({ product }: Props) {
  const [main, sideTop, sideBottom] = product.heroImages;

  return (
    <section className="pt-[80px] sm:pt-[84px]">
      <p className="text-sm font-bold text-[#1A1A1A] mb-6 sm:mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 hover:opacity-70 transition"
        >
          <span aria-hidden className="text-base font-bold leading-none">
            &lt;
          </span>
          Product
        </Link>
        <span className="mx-2 font-bold">/</span>
        <span className="font-bold">{product.name}</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        <div className="group relative lg:col-span-2 h-[280px] sm:h-[380px] md:h-[460px] lg:h-[540px] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden">
          <Image
            src={main}
            alt={product.name}
            fill
            priority
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute left-5 right-5 sm:left-8 sm:right-8 bottom-6 sm:bottom-8 text-left pointer-events-none">
            <p className="text-white/80 text-xs sm:text-sm tracking-wide mb-1.5">
              TK / {product.name}
            </p>
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold leading-none">
              {product.name}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-5 lg:h-[540px]">
          <div className="group relative h-[160px] sm:h-[200px] lg:h-full rounded-[1.5rem] sm:rounded-[1.75rem] overflow-hidden">
            <Image
              src={sideTop}
              alt={`${product.name} angle`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          </div>
          <div className="group relative h-[160px] sm:h-[200px] lg:h-full rounded-[1.5rem] sm:rounded-[1.75rem] overflow-hidden">
            <Image
              src={sideBottom}
              alt={`${product.name} detail`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
