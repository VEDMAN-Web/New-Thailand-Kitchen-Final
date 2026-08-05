"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { galleryHero } from "./galleryData";
import { useTranslation } from "../../i18n/LanguageProvider";
import { fetchHomeSections } from "../../services/cmsPublic";

const FRAME =
  "relative w-full h-[180px] sm:h-[200px] lg:h-[220px] shrink-0 rounded-[1.5rem] sm:rounded-[1.75rem] overflow-hidden";

const DEFAULT_LEFT = [
  galleryHero.collage[0],
  galleryHero.collage[2],
  "/products/Kitchen2.png",
  "/features/image3.png",
];

const DEFAULT_RIGHT = [
  galleryHero.collage[1],
  galleryHero.collage[3],
  "/products/Kitchen4.png",
  "/catlog/catlog.png",
];

function ScrollColumn({
  images,
  direction,
  offset,
}: {
  images: string[];
  direction: "up" | "down";
  offset?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const loop = [...images, ...images];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const durationMs = 16000;
    const start = performance.now();

    const tick = (now: number) => {
      const half = track.scrollHeight / 2;
      if (half <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const progress = ((now - start) % durationMs) / durationMs;
      const y =
        direction === "up" ? -progress * half : -half + progress * half;

      track.style.transform = `translate3d(0, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [direction, images]);

  return (
    <div
      className={`flex-1 min-w-0 h-[380px] sm:h-[420px] lg:h-[460px] overflow-hidden ${
        offset ? "mt-10 sm:mt-14" : ""
      }`}
    >
      <div
        ref={trackRef}
        className="flex flex-col gap-3 sm:gap-4 will-change-transform"
      >
        {loop.map((src, i) => (
          <div key={`${src}-${i}`} className={FRAME}>
            <Image
              src={src}
              alt="Gallery inspiration"
              fill
              className="object-cover pointer-events-none select-none"
              sizes="(max-width: 1024px) 45vw, 22vw"
              priority={i < 2}
              unoptimized={src.startsWith("/uploads") || src.startsWith("http")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type GalleryPageCms = {
  eyebrow?: string;
  title?: string;
  description?: string;
  collage?: string[];
};

export default function GalleryHero() {
  const { t, locale } = useTranslation();
  const [cms, setCms] = useState<GalleryPageCms | null>(null);

  useEffect(() => {
    let alive = true;
    fetchHomeSections().then((sections) => {
      if (!alive) return;
      setCms((sections?.galleryPage as GalleryPageCms) || null);
    });
    return () => {
      alive = false;
    };
  }, []);

  const useCmsCopy = locale === "EN";
  const eyebrow =
    useCmsCopy && cms?.eyebrow?.trim()
      ? cms.eyebrow.trim()
      : t("gallery.hero.eyebrow");
  const title =
    useCmsCopy && cms?.title?.trim()
      ? cms.title.trim()
      : t("gallery.hero.title");
  const description =
    useCmsCopy && cms?.description?.trim()
      ? cms.description.trim()
      : t("gallery.hero.description");

  const collage = (cms?.collage || []).filter(Boolean);
  const leftImages =
    collage.length >= 2
      ? [collage[0], collage[2] || collage[0], collage[0], collage[2] || collage[0]]
      : DEFAULT_LEFT;
  const rightImages =
    collage.length >= 2
      ? [collage[1], collage[3] || collage[1], collage[1], collage[3] || collage[1]]
      : DEFAULT_RIGHT;

  return (
    <section className="pt-[80px] sm:pt-[84px] pb-8 lg:pb-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-semibold mb-4">
              {eyebrow}
            </p>
            <h1 className="text-[#1A1A1A] text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.05]">
              {title}
            </h1>
            <p className="mt-5 text-[#6B6B6B] text-sm sm:text-base leading-7 max-w-lg">
              {description}
            </p>
          </div>

          <div className="flex gap-3 sm:gap-4 items-start">
            <ScrollColumn images={leftImages} direction="up" offset />
            <ScrollColumn images={rightImages} direction="down" />
          </div>
        </div>
      </div>
    </section>
  );
}
