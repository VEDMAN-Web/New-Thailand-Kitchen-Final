"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function BlogHero() {
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
          src="/blog/Video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => {
            videoRef.current?.play().catch(() => {});
          }}
          aria-label="Thailand Kitchens journal"
          className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 flex flex-col items-start justify-center text-left px-6 sm:px-10 lg:px-14">
          <p className="text-[#E0905A] text-xs tracking-[0.3em] uppercase font-semibold mb-4">
            {t("blog.hero.eyebrow")}
          </p>
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold leading-none">
            {t("blog.hero.title")}
          </h1>
        </div>
      </div>
    </section>
  );
}
