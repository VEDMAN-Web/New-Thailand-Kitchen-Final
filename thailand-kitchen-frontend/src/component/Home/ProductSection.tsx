"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { products } from "./ProductData";
import { useCms } from "../../lib/CmsHomeContext";
import { useTranslation } from "../../i18n/LanguageProvider";

function toProductHref(slug: string) {
  const clean = String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
  return clean ? `/products/${encodeURIComponent(clean)}` : "/products";
}

const ProductSection = () => {
  const { t } = useTranslation();
  const { products: cmsProducts, loading } = useCms();
  const items = useMemo(() => {
    // Keep UI stable: while CMS is loading, render nothing here.
    if (loading) return [];

    if (cmsProducts.length > 0) {
      return cmsProducts.slice(0, 3).map((p) => ({
        id: p.id,
        title: p.name,
        image: p.image,
        href: toProductHref(p.slug),
      }));
    }

    return products.slice(0, 3).map((p) => ({
      id: p.id,
      title: p.title,
      image: p.image,
      href: "/products",
    }));
  }, [cmsProducts, loading]);

  const [active, setActive] = useState<number | null>(null);

  if (loading) {
    return (
      <section className="pb-6 lg:pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-[320px] sm:h-[520px] lg:h-[600px] rounded-2xl bg-[#ECE7DF] animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="pb-6 lg:pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 h-auto sm:h-[520px] lg:h-[600px]"
          onMouseLeave={() => setActive(null)}
        >
          {items.map((product, index) => {
            const isActive = active === index;
            const isIdle = active === null;

            return (
              <Link
                key={product.id}
                href={product.href}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={`group relative flex flex-col min-w-0 overflow-hidden transition-[flex] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isIdle
                    ? "sm:flex-1"
                    : isActive
                      ? "sm:flex-[2.4]"
                      : "sm:flex-[0.8]"
                }`}
              >
                <div className="relative w-full h-[320px] sm:h-full overflow-hidden rounded-2xl">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className={`object-cover transition-transform duration-700 ease-out ${
                      isActive ? "scale-105" : "scale-100"
                    }`}
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>

                <p
                  className={`mt-4 text-sm sm:text-base font-bold uppercase tracking-[0.08em] text-[#1A1A1A] transition-opacity duration-500 ${
                    isIdle || isActive ? "opacity-100" : "opacity-70"
                  }`}
                >
                  {product.title}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="hidden sm:flex justify-center gap-2 mt-6">
          {items.map((product, index) => (
            <button
              key={product.id}
              type="button"
              aria-label={`Show ${product.title}`}
              onClick={() => setActive(index)}
              className={`h-2.5 w-2.5 rounded-full border transition-colors duration-300 ${
                active === index
                  ? "border-[#1A1A1A] bg-white"
                  : "border-[#C8C0B6] bg-[#D8D2C8]"
              }`}
            />
          ))}
        </div>

        <div className="sm:hidden flex justify-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center bg-[#1A1A1A] text-white px-6 py-3 rounded-full text-sm font-medium"
          >
            {t("home.products.cta")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
