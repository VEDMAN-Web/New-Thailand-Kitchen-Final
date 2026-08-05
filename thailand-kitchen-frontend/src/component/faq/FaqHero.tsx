"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function FaqHero() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => {
          /* Autoplay can be blocked until interaction */
        });
      }
    };

    video.load();
    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("canplaythrough", tryPlay);

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("canplaythrough", tryPlay);
    };
  }, []);

  return (
    <section className="bg-[#F5F3EF] px-3 pt-[80px] sm:px-4 sm:pt-[84px]">
      <div className="relative w-full h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-[#1A1A1A]">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => {
            videoRef.current?.play().catch(() => {});
          }}
          aria-label="Kitchen FAQ"
          className="absolute inset-0 z-0 h-full w-full object-cover object-center pointer-events-none"
        >
          <source src="/video/faq-autoplay.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-[1] bg-black/45" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
          <p
            className="text-xs tracking-[0.3em] uppercase font-semibold mb-4"
            style={{ color: "#E0905A" }}
          >
            {t("faq.hero.eyebrow")}
          </p>
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
            {t("faq.hero.title")}
          </h1>
        </div>
      </div>
    </section>
  );
}
