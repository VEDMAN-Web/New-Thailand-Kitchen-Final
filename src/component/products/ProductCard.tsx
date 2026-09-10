"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductItem } from "./productData";
import { useTranslation } from "../../i18n/LanguageProvider";
import { pickCmsText } from "../../lib/cmsText";
import { DEFAULT_OG_IMAGE } from "../../lib/siteUrl";

interface Props {
  product: ProductItem;
}

function normalizedSlug(slug: string) {
  return String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

export default function ProductCard({ product }: Props) {
  const { t, locale } = useTranslation();
  const slug = normalizedSlug(product.slug);
  const name = pickCmsText(product.name, "", locale);
  const layout = pickCmsText(product.layout, product.layout, locale);
  const finish = pickCmsText(product.finish, "", locale);
  const material = pickCmsText(product.material, "", locale);
  const imageSrc = String(product.image || "").trim() || DEFAULT_OG_IMAGE;
  const isRemote =
    imageSrc.startsWith("http") || imageSrc.startsWith("/uploads");

  return (
    <Link 
      href={`/products/${slug}`}
      className="block bg-white rounded-[1.75rem] overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow h-full"
    >
      <article className="flex flex-col h-full">
        <div className="relative w-full h-50 sm:aspect-4/3 sm:h-auto overflow-hidden shrink-0 bg-[#E8E4DC]">
          <Image
            src={imageSrc}
            alt={name || "Kitchen product"}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={isRemote}
          />
        </div>

        <div className="p-4 sm:p-6 flex flex-col flex-1">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#1A1A1A] line-clamp-2">{name}</h3>
            <p className="mt-1 text-xs sm:text-sm text-[#8A8A8A] line-clamp-1">{layout}</p>

            <div className="mt-3 sm:mt-5 grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-[10px] tracking-[0.18em] uppercase text-[#9A9A9A]">
                  {t("products.card.finish")}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-[#1A1A1A] line-clamp-1">{finish}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.18em] uppercase text-[#9A9A9A]">
                  {t("products.card.material")}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-[#1A1A1A] line-clamp-1">{material}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 inline-flex items-center justify-center gap-2 w-full h-11 sm:h-12 rounded-full bg-[#1A1A1A] text-white text-sm font-semibold hover:bg-black transition shrink-0">
            {t("products.viewDetails")}
            <span aria-hidden>↗</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
