"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useCmsSection } from "../../lib/CmsHomeContext";
import { pickCmsAsset, pickCmsText } from "../../lib/cmsText";

type BlogPageCms = {
  eyebrow?: string;
  title?: string;
  videoUrl?: string;
};

export default function BlogHero() {
  const { t, locale } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cms = useCmsSection<BlogPageCms>("blogPage");

  const eyebrow = pickCmsText(cms?.eyebrow, t("blog.hero.eyebrow"), locale);
  const title = pickCmsText(cms?.title, t("blog.hero.title"), locale);
  const videoSrc = pickCmsAsset(cms?.videoUrl, "") || "/blog/Video.mp4";

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
          preload="metadata"
          onCanPlay={() => {
            videoRef.current?.play().catch(() => {});
          }}
          aria-label="Thailand Kitchens journal"
          className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 flex flex-col items-start justify-center text-left px-6 sm:px-10 lg:px-14">
          <p className="text-[#E0905A] text-xs tracking-[0.3em] uppercase font-semibold mb-4">
            {eyebrow}
          </p>
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold leading-none">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
