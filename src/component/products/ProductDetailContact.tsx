"use client";

import Image from "next/image";
import { ProductItem } from "./productData";
import ProductDetailContactForm from "./ProductDetailContactForm";
import { useTranslation } from "../../i18n/LanguageProvider";
import { pickCmsText } from "../../lib/cmsText";

interface Props {
  product: ProductItem;
}

export default function ProductDetailContact({ product }: Props) {
  const { t, locale } = useTranslation();
  const name = pickCmsText(product.name, "Kitchen", locale);
  const eyebrow = pickCmsText(
    product.contactEyebrow,
    t("productDetail.contact.eyebrow"),
    locale
  );
  const title = pickCmsText(
    product.contactTitle,
    t("productDetail.contact.title"),
    locale
  );
  const formTitle = pickCmsText(
    product.contactFormTitle,
    t("productDetail.contact.formTitle"),
    locale
  );
  const contactImage =
    String(product.contactImage || "").trim() ||
    String(product.image || "").trim() ||
    "/products/Kitchen2.png";

  return (
    <section className="py-8 sm:py-20 lg:py-24">
      <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
        {eyebrow}
      </p>
      <h2 className="text-2xl min-[425px]:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] mb-6 sm:mb-10 lg:mb-14 break-words">
        {title}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-stretch">
        <div className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-4 sm:p-8 lg:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
          <h3 className="text-lg sm:text-2xl lg:text-[1.65rem] font-extrabold text-[#1A1A1A] leading-snug mb-5 sm:mb-8">
            {formTitle}
          </h3>
          <ProductDetailContactForm />
        </div>

        <div className="relative min-h-50 sm:min-h-[420px] lg:min-h-full rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden">
          <Image
            src={contactImage}
            alt={`${name} kitchen interior`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized={
              contactImage.startsWith("http") ||
              contactImage.startsWith("/uploads")
            }
          />
        </div>
      </div>
    </section>
  );
}
