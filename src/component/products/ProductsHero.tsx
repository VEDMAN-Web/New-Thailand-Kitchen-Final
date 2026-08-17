"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useCmsSection } from "../../lib/CmsHomeContext";
import { pickCmsAsset, pickCmsText } from "../../lib/cmsText";
import { useResolvedMediaUrl } from "../../lib/useResolvedMediaUrl";
import { productHero } from "./productData";

type ProductsPageCms = {
  label?: string;
  title?: string;
  videoUrl?: string;
};

export default function ProductsHero() {
  const { t, locale } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cms = useCmsSection<ProductsPageCms>("productsPage");

  const label = pickCmsText(cms?.label, t("products.hero.label"), locale);
  const title = pickCmsText(cms?.title, t("products.hero.title"), locale);
  const videoSrc =
    useResolvedMediaUrl(pickCmsAsset(cms?.videoUrl, ""), "video") ||
    productHero.video;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {});
  }, [videoSrc]);

  return (
    <section className="bg-[#F5F3EF] px-3 pt-[80px] sm:px-4 sm:pt-[84px]">
      <div className="relative w-full h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden">
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
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
            {label}
          </p>
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
