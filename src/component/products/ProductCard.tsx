"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductItem } from "./productData";
import { useTranslation } from "../../i18n/LanguageProvider";

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
  const { t } = useTranslation();
  const slug = normalizedSlug(product.slug);

  return (
    <article className="bg-white rounded-[1.75rem] overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.04)] flex flex-col h-full text-left">
      <Link
        href={`/products/${slug}`}
        className="relative block w-full aspect-[4/3] overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h3 className="text-xl font-extrabold text-[#1A1A1A]">{product.name}</h3>
        <p className="mt-1 text-sm text-[#8A8A8A]">{product.layout}</p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] tracking-[0.18em] uppercase text-[#9A9A9A]">
              {t("products.card.finish")}
            </p>
            <p className="mt-1 text-sm text-[#1A1A1A]">{product.finish}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.18em] uppercase text-[#9A9A9A]">
              {t("products.card.material")}
            </p>
            <p className="mt-1 text-sm text-[#1A1A1A]">{product.material}</p>
          </div>
        </div>

        <Link
          href={`/products/${slug}`}
          className="mt-6 inline-flex items-center justify-center gap-2 w-full h-12 rounded-full bg-[#1A1A1A] text-white text-sm font-semibold hover:bg-black transition"
        >
          {t("products.viewDetails")}
          <span aria-hidden>↗</span>
        </Link>
      </div>
    </article>
  );
}
