"use client";

import { useEffect, useRef } from "react";
import { productHero } from "./productData";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function ProductsHero() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {});
  }, []);

  return (
    <section className="bg-[#F5F3EF] px-3 pt-[80px] sm:px-4 sm:pt-[84px]">
      <div className="relative w-full h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden">
        <video
          ref={videoRef}
          src={productHero.video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => {
            videoRef.current?.play().catch(() => {});
          }}
          aria-label="Thailand Kitchens products"
          className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-white/80 text-xs tracking-[0.28em] uppercase font-medium mb-3">
            {t("products.hero.label")}
          </p>
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold leading-none">
            {t("products.hero.title")}
          </h1>
        </div>
      </div>
    </section>
  );
}
