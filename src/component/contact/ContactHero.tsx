"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useCmsSection } from "../../lib/CmsHomeContext";
import { pickCmsAsset, pickCmsText } from "../../lib/cmsText";

type ContactPageCms = {
  title?: string;
  titleAccent?: string;
  description?: string;
  videoUrl?: string;
};

export default function ContactHero() {
  const { t, locale } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cms = useCmsSection<ContactPageCms>("contactPage");

  const title = pickCmsText(cms?.title, t("contact.hero.title"), locale);
  const titleAccent = pickCmsText(
    cms?.titleAccent,
    t("contact.hero.titleAccent"),
    locale
  );
  const description = pickCmsText(
    cms?.description,
    t("contact.hero.description"),
    locale
  );
  const videoSrc =
    pickCmsAsset(cms?.videoUrl, "") || "/video/contact.mp4?v=2";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.load();
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
          aria-label="Kitchen design consultation"
          className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto">
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            {title} {titleAccent}
          </h1>
          <p className="mt-5 text-white/90 text-sm sm:text-base leading-7 max-w-2xl">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
