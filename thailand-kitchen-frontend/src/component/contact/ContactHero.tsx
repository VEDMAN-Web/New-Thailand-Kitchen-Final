"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function ContactHero() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.load();
    video.play().catch(() => {});
  }, []);

  return (
    <section className="bg-[#F5F3EF] px-3 pt-[80px] sm:px-4 sm:pt-[84px]">
      <div className="relative w-full h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden">
        <video
          ref={videoRef}
          src="/video/contact.mp4?v=2"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => {
            videoRef.current?.play().catch(() => {});
          }}
          aria-label="Kitchen design consultation"
          className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto">
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
            {t("contact.hero.title")} {t("contact.hero.titleAccent")}
          </h1>
          <p className="mt-5 text-white/90 text-sm sm:text-base leading-7 max-w-2xl">
            {t("contact.hero.description")}
          </p>
        </div>
      </div>
    </section>
  );
}
