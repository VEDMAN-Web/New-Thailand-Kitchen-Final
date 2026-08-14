"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useCmsSection } from "../../lib/CmsHomeContext";
import { pickCmsText } from "../../lib/cmsText";
import {
  DEFAULT_BLOG_COVER,
  DEFAULT_BLOG_HERO_VIDEO,
  isDirectImageUrl,
  isDirectVideoUrl,
  isEmbedVideoUrl,
  resolveCmsMediaUrl,
  toEmbedVideoSrc,
} from "../../lib/cmsMedia";

type BlogPageCms = {
  eyebrow?: string;
  title?: string;
  videoUrl?: string;
};

export default function BlogHero() {
  const { t, locale } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cms = useCmsSection<BlogPageCms>("blogPage");
  const [videoFailed, setVideoFailed] = useState(false);

  const eyebrow = pickCmsText(cms?.eyebrow, t("blog.hero.eyebrow"), locale);
  const title = pickCmsText(cms?.title, t("blog.hero.title"), locale);
  const mediaSrc =
    resolveCmsMediaUrl(cms?.videoUrl) ||
    resolveCmsMediaUrl(DEFAULT_BLOG_HERO_VIDEO);

  const showEmbed = Boolean(mediaSrc && isEmbedVideoUrl(mediaSrc));
  const showImage =
    Boolean(mediaSrc) &&
    !showEmbed &&
    (isDirectImageUrl(mediaSrc) || videoFailed);
  const showVideo =
    Boolean(mediaSrc) &&
    !showEmbed &&
    !showImage &&
    isDirectVideoUrl(mediaSrc);
  const imageDisplaySrc = isDirectImageUrl(mediaSrc)
    ? mediaSrc
    : resolveCmsMediaUrl(DEFAULT_BLOG_COVER);

  useEffect(() => {
    setVideoFailed(false);
  }, [mediaSrc]);

  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {});
  }, [mediaSrc, showVideo]);

  return (
    <section className="bg-[#F5F3EF] px-3 pt-[80px] sm:px-4 sm:pt-[84px]">
      <div className="relative w-full h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-[#1A1A1A]">
        {showEmbed ? (
          <iframe
            key={mediaSrc}
            title="Guides hero video"
            src={toEmbedVideoSrc(mediaSrc)}
            className="absolute inset-0 h-full w-full pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : showImage ? (
          <Image
            key={imageDisplaySrc}
            src={imageDisplaySrc}
            alt=""
            fill
            priority
            className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
            unoptimized
          />
        ) : showVideo ? (
          <video
            ref={videoRef}
            key={mediaSrc}
            src={mediaSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
            onCanPlay={() => {
              videoRef.current?.play().catch(() => {});
            }}
            aria-label="Thailand Kitchens journal"
            className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
          />
        ) : null}

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 flex flex-col items-start justify-center text-left px-6 sm:px-10 lg:px-14">
          <p className="text-[#E0905A] text-xs tracking-[0.3em] uppercase font-semibold mb-4">
            {eyebrow}
          </p>
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
