"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductItem } from "./productData";
import { useTranslation } from "../../i18n/LanguageProvider";
import { pickCmsText } from "../../lib/cmsText";
import { formatBahtRange, priceLabels, productPriceRange } from "../../lib/priceRange";

interface Props {
  product: ProductItem;
}

export default function ProductDetailHero({ product }: Props) {
  const { t, locale } = useTranslation();
  const name = pickCmsText(product.name, "", locale);
  const [main, sideTop, sideBottom] = product.heroImages;
  const price = productPriceRange(product.features);
  const priceText = priceLabels(locale);

  function isRemote(src: string) {
    return src.startsWith("http") || src.startsWith("/uploads");
  }

  return (
    <section className="pt-[80px] sm:pt-[84px]">
      <p className="text-sm font-bold text-[#1A1A1A] mb-4 sm:mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 hover:opacity-70 transition"
        >
          <span aria-hidden className="text-base font-bold leading-none">
            &lt;
          </span>
          {t("productDetail.breadcrumb")}
        </Link>
        <span className="mx-2 font-bold">/</span>
        <span className="font-bold">{name}</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        <div className="group relative lg:col-span-2 h-44 sm:h-[380px] md:h-[460px] lg:h-[540px] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden">
          <Image
            src={main}
            alt={name}
            fill
            priority
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 1024px) 100vw, 66vw"
            unoptimized={isRemote(main)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute left-5 right-5 sm:left-8 sm:right-8 bottom-6 sm:bottom-8 text-left pointer-events-none">
            <p className="text-white/80 text-xs sm:text-sm tracking-wide mb-1.5">
              TK / {name}
            </p>
            <h1 className="text-white text-2xl min-[425px]:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight break-words">
              {name}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-5 lg:h-[540px]">
          <div className="group relative h-28 sm:h-[200px] lg:h-full rounded-[1.5rem] sm:rounded-[1.75rem] overflow-hidden">
            <Image
              src={sideTop}
              alt={`${name} angle`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 1024px) 50vw, 33vw"
              unoptimized={isRemote(sideTop)}
            />
          </div>
          <div className="group relative h-28 sm:h-[200px] lg:h-full rounded-[1.5rem] sm:rounded-[1.75rem] overflow-hidden">
            <Image
              src={sideBottom}
              alt={`${name} detail`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 1024px) 50vw, 33vw"
              unoptimized={isRemote(sideBottom)}
            />
          </div>
        </div>
      </div>

      {price ? (
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 rounded-2xl bg-white border border-[#E8E4DC] px-5 py-4 sm:px-6">
          <p className="shrink-0">
            <span className={`block text-[10px] text-[#9A9A9A] ${locale === "TH" ? "text-xs" : "tracking-[0.18em] uppercase"}`}>
              {priceText.typicalPrice}
            </span>
            <span className="block text-xl sm:text-2xl font-extrabold text-[#1A1A1A]">
              {formatBahtRange(price, locale)}
            </span>
          </p>
          <p className="text-xs sm:text-sm text-[#6B6B6B] leading-6 sm:border-l sm:border-[#E8E4DC] sm:pl-4">
            {priceText.priceIncludes}
          </p>
        </div>
      ) : null}
    </section>
  );
}
