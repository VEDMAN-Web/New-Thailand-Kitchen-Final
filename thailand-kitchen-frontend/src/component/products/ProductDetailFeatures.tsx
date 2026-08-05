"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductItem } from "./productData";

interface Props {
  product: ProductItem;
}

export default function ProductDetailFeatures({ product }: Props) {
  const images = (product.detailImages || []).filter(Boolean);
  const [active, setActive] = useState(0);

  if (!product.features.length && !images.length) return null;

  const total = images.length;
  const primary = images[active] || images[0];
  const secondary = images[(active + 1) % total] || images[0];

  const goPrev = () => setActive((i) => (i - 1 + total) % total);
  const goNext = () => setActive((i) => (i + 1) % total);

  return (
    <section className="pt-16 sm:pt-20 lg:pt-24 pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <ul className="space-y-8 sm:space-y-10">
          {product.features.map((feature) => (
            <li key={feature.title} className="flex gap-4 sm:gap-5">
              <span
                className="mt-1 shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#E0905A] flex items-center justify-center"
                aria-hidden
              >
                <span className="w-2 h-2 rounded-full bg-[#E0905A]" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#1A1A1A]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm sm:text-[15px] text-[#6B6B6B] leading-7 max-w-md">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {primary ? (
          <div className="w-full max-w-md lg:max-w-none mx-auto lg:mx-0">
            <div className="flex items-end gap-2.5 sm:gap-3 w-full">
              <div className="group relative w-[58%] aspect-[3/4] rounded-[1.5rem] sm:rounded-[1.75rem] overflow-hidden shrink-0">
                <Image
                  key={primary}
                  src={primary}
                  alt={`${product.name} finish detail`}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 1024px) 45vw, 22vw"
                />
              </div>
              {secondary && total > 1 ? (
                <div className="group relative w-[38%] aspect-[2/3] mb-4 sm:mb-6 rounded-[1.5rem] sm:rounded-[1.75rem] overflow-hidden shrink-0">
                  <Image
                    key={secondary}
                    src={secondary}
                    alt={`${product.name} material detail`}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    sizes="(max-width: 1024px) 30vw, 15vw"
                  />
                </div>
              ) : null}
            </div>

            {total > 2 ? (
              <div className="mt-5 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous feature image"
                  className="w-9 h-9 rounded-full border border-[#C9C2B6] flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`Go to feature image ${index + 1}`}
                      className={`rounded-full transition-all ${
                        index === active
                          ? "w-5 h-2 bg-[#E0905A]"
                          : "w-2 h-2 bg-[#C9C2B6] hover:bg-[#A79E8F]"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next feature image"
                  className="w-9 h-9 rounded-full border border-[#C9C2B6] flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
