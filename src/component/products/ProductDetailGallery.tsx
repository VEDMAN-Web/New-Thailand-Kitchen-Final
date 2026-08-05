"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductItem } from "./productData";

interface Props {
  product: ProductItem;
}

export default function ProductDetailGallery({ product }: Props) {
  const slides = product.gallery.length ? product.gallery : [];
  const [active, setActive] = useState(0);

  if (!slides.length) return null;

  const total = slides.length;
  const goPrev = () => setActive((i) => (i - 1 + total) % total);
  const goNext = () => setActive((i) => (i + 1) % total);

  return (
    <section className="pt-12 sm:pt-14 lg:pt-16">
      <div className="group relative w-full h-[280px] sm:h-[380px] md:h-[440px] lg:h-[480px] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={`${slide.image}-${index}`}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.caption}
              fill
              priority={index === 0}
              className="object-cover object-center scale-[1.12] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-100"
              sizes="(max-width: 1152px) 100vw, 1152px"
            />
          </div>
        ))}
      </div>

      {/* Carousel controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous image"
          className="w-10 h-10 rounded-full border border-[#C9C2B6] flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Go to image ${index + 1}`}
              className={`rounded-full transition-all ${
                index === active
                  ? "w-6 h-2 bg-[#E0905A]"
                  : "w-2 h-2 bg-[#C9C2B6] hover:bg-[#A79E8F]"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next image"
          className="w-10 h-10 rounded-full border border-[#C9C2B6] flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    </section>
  );
}
