"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useCmsSection } from "../../lib/CmsHomeContext";

export default function AboutSection() {
  const { t, locale } = useTranslation();
  const story = useCmsSection<{
    title?: string;
    subtitle?: string;
    description?: string;
  }>("story");
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageVisible, setImageVisible] = useState(false);

  // CMS story copy is English-only — use i18n for TH/PL
  const eyebrow =
    locale === "EN" && story?.subtitle
      ? story.subtitle
      : t("home.about.eyebrow");
  const sectionTitle =
    locale === "EN" && story?.title ? story.title : t("home.about.title");
  const cardTitle =
    locale === "EN" && story?.title ? story.title : t("home.about.cardTitle");
  const cardDescription =
    locale === "EN" && story?.description
      ? story.description
      : t("home.about.cardDescription");

  useEffect(() => {
    const el = imageRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
      <section id="our-service" className="bg-[#F5F3EF] pb-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
          {eyebrow}
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] mb-10 lg:mb-12">
          {sectionTitle}
        </h2>

        <div className="relative">
          <div
            ref={imageRef}
            className={`relative w-full h-[280px] sm:h-[380px] md:h-[460px] lg:h-[520px] rounded-2xl overflow-hidden transition-all duration-[1200ms] ease-out ${
              imageVisible
                ? "scale-100 opacity-100"
                : "scale-[0.88] opacity-0"
            }`}
          >
            <Image
              src="/slider/crafted-with-passion.png"
              alt="Crafted kitchen interior"
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
          </div>

          <div className="group relative md:absolute md:left-8 lg:left-12 md:top-1/2 md:-translate-y-1/2 md:w-[min(440px,46%)] mt-6 md:mt-0 bg-white rounded-2xl p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out hover:bg-[#1A1A1A] hover:shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A] leading-snug transition-colors duration-500 group-hover:text-white">
              {cardTitle}
            </h3>
            <p className="mt-4 text-[#6B6B6B] text-sm sm:text-[15px] leading-7 transition-colors duration-500 group-hover:text-white/75">
              {cardDescription}
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#1A1A1A] transition-colors duration-500 group-hover:text-[#E0905A]"
            >
              {t("home.about.cta")}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
