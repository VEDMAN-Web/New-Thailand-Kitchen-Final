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
        {slides.map((slide, index) => {
          const isRemote =
            slide.image.startsWith("http") ||
            slide.image.startsWith("/uploads");
          return (
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
                unoptimized={isRemote}
              />
            </div>
          );
        })}
      </div>

      {/* Carousel controls */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous image"
          disabled={slides.length <= 1}
          className="group w-12 h-12 rounded-full bg-white border-2 border-[#E8E3DD] shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#1A1A1A] hover:border-[#1A1A1A] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E8E3DD] disabled:hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="transform group-active:scale-90 transition-transform">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Go to image ${index + 1}`}
              aria-current={index === active ? "true" : "false"}
              className={`rounded-full transition-all duration-300 ${
                index === active
                  ? "w-8 h-2.5 bg-gradient-to-r from-[#E0905A] to-[#D17A3F] shadow-[0_2px_8px_rgba(224,144,90,0.4)]"
                  : "w-2.5 h-2.5 bg-[#D4C4B0] hover:bg-[#B8A890] hover:scale-125 active:scale-110"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next image"
          disabled={slides.length <= 1}
          className="group w-12 h-12 rounded-full bg-white border-2 border-[#E8E3DD] shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#1A1A1A] hover:border-[#1A1A1A] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E8E3DD] disabled:hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="transform group-active:scale-90 transition-transform">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
