"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import { ProductItem } from "./productData";
import { useTranslation } from "../../i18n/LanguageProvider";
import { pickCmsText } from "../../lib/cmsText";

interface Props {
  product: ProductItem;
}

export default function ProductDetailNarrative({ product }: Props) {
  const { locale } = useTranslation();
  const icon = product.icon?.trim();
  const pdfUrl = product.pdfUrl?.trim();
  const remoteIcon =
    Boolean(icon) &&
    (icon!.startsWith("http") || icon!.startsWith("/uploads"));
  const tag = pickCmsText(product.tag, "", locale);
  const headline = pickCmsText(product.headline, "", locale);
  const description = pickCmsText(product.description, "", locale);

  return (
    <section className="pt-14 sm:pt-16 lg:pt-20 max-w-4xl">
      <div className="flex items-center gap-3 mb-4">
        {icon ? (
          <span className="relative h-8 w-8 shrink-0">
            <Image
              src={icon}
              alt=""
              fill
              className="object-contain"
              sizes="32px"
              unoptimized={remoteIcon}
            />
          </span>
        ) : null}
        <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-semibold">
          {tag}
        </p>
      </div>
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-[#1A1A1A] leading-tight">
        {headline}
      </h2>
      <p className="mt-5 sm:mt-6 text-[#5A5A5A] text-sm sm:text-base leading-7 sm:leading-8 max-w-3xl">
        {description}
      </p>
      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] text-white px-5 py-2.5 text-sm font-semibold hover:bg-black transition"
        >
          <Download size={16} />
          Download brochure
        </a>
      ) : null}
    </section>
  );
}
