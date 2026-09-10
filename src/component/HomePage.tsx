"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import ProductSection from "./Home/ProductSection";
import CatalogSection from "./catlog/CatlogSection";
import { useTranslation } from "../i18n/LanguageProvider";
import { useCms, useCmsSection } from "../lib/CmsHomeContext";
import { pickCmsText } from "../lib/cmsText";
import { useResolvedMediaUrl } from "../lib/useResolvedMediaUrl";
import { approvedCmsText } from "../lib/pageMetadata";
import type { ProductItem } from "./products/productData";
import type { CmsCatalogue } from "../services/cmsPublic";

/** Below-fold: split compile. In `next dev`, skip SSR so `/` compiles faster.
 * Production keeps SSR. Options must be object literals (Turbopack). */
const BrandSlider = dynamic(
  () => import("./brandLogo/BrandSlider"),
  { ssr: process.env.NODE_ENV !== "development" }
);
const AboutSection = dynamic(
  () => import("./about/AboutSection"),
  { ssr: process.env.NODE_ENV !== "development" }
);
const CraftBar = dynamic(() => import("./features/CraftBar"), {
  ssr: process.env.NODE_ENV !== "development",
});
const TestimonialSection = dynamic(
  () => import("./imageFeedback/TestimonialSection"),
  { ssr: process.env.NODE_ENV !== "development" }
);
const StatsSection = dynamic(() => import("./section"), {
  ssr: process.env.NODE_ENV !== "development",
});
const FeatureSection = dynamic(
  () => import("./features/FeatureSection"),
  { ssr: process.env.NODE_ENV !== "development" }
);
const HomeFaqSection = dynamic(
  () => import("./faq/HomeFaqSection"),
  { ssr: process.env.NODE_ENV !== "development" }
);
const ContactSection = dynamic(
  () => import("./contactUs/ContactSection"),
  { ssr: process.env.NODE_ENV !== "development" }
);

const STATIC_FALLBACK_VIDEO = "/video/2.mp4";

function HomePage({
  initialProducts = [],
  initialCatalogues = [],
}: {
  initialProducts?: ProductItem[];
  initialCatalogues?: CmsCatalogue[];
}) {
  const { t, locale } = useTranslation();
  const { loading: cmsLoading } = useCms();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const hero = useCmsSection<{
    subtitle?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    videoUrl?: string;
    image?: string;
    poster?: string;
  }>("hero");
  const productsPage = useCmsSection<{
    homeEyebrow?: string;
    homeTitle?: string;
    homeCta?: string;
  }>("productsPage");
  const testimonials = useCmsSection<{
    eyebrow?: string;
    title?: string;
  }>("testimonials");
  const advantages = useCmsSection<{
    eyebrow?: string;
    title?: string;
  }>("advantages");
  const catalogue = useCmsSection<{
    eyebrow?: string;
    title?: string;
  }>("catalogue");

  // CMS-first on EN. TH/PL prefer i18n so language switch works.
  const heroSubtitle = pickCmsText(hero?.subtitle, t("home.hero.eyebrow"), locale);
  const heroTitle = pickCmsText(hero?.title, t("home.hero.title"), locale);
  const heroDescription = approvedCmsText(
    hero?.description,
    t("home.hero.description"),
    locale,
    pickCmsText
  );
  const heroCta = pickCmsText(hero?.buttonText, t("home.hero.cta"), locale);
  const productsEyebrow = pickCmsText(
    productsPage?.homeEyebrow,
    t("home.products.eyebrow"),
    locale
  );
  const productsTitle = pickCmsText(
    productsPage?.homeTitle,
    t("home.products.title"),
    locale
  );
  const productsCta = pickCmsText(
    productsPage?.homeCta,
    t("home.products.cta"),
    locale
  );
  const testimonialsEyebrow = pickCmsText(
    testimonials?.eyebrow,
    t("home.testimonials.eyebrow"),
    locale
  );
  const testimonialsTitle = pickCmsText(
    testimonials?.title,
    t("home.testimonials.title"),
    locale
  );
  const featuresEyebrow = pickCmsText(
    advantages?.eyebrow,
    t("home.features.eyebrow"),
    locale
  );
  const featuresTitle = pickCmsText(
    advantages?.title,
    t("home.features.title"),
    locale
  );
  const catalogEyebrow = pickCmsText(
    catalogue?.eyebrow,
    t("home.catalog.eyebrow"),
    locale
  );
  const catalogTitle = pickCmsText(
    catalogue?.title,
    t("home.catalog.title"),
    locale
  );

  // Only fall back to the static video AFTER the CMS has finished loading and
  // confirmed there is no uploaded video. While loading (or when a CMS video
  // exists), never let the static fallback override the CMS url — that is what
  // caused the old-then-new double-play on every refresh.
  const cmsVideoUrl = useResolvedMediaUrl(hero?.videoUrl || "", "video").trim();
  const heroVideo = cmsVideoUrl
    ? cmsVideoUrl
    : cmsLoading
    ? "" // CMS still resolving — show nothing until we know
    : STATIC_FALLBACK_VIDEO; // CMS done, no video configured → use default

  const heroPoster =
    useResolvedMediaUrl(
      String(hero?.poster || hero?.image || "").trim(),
      "image"
    ) || "/products/Kitchen1.png";

  const isEmbed =
    Boolean(heroVideo) && /youtube\.com|youtu\.be|vimeo\.com/i.test(heroVideo);

  const embedSrc = (() => {
    if (!isEmbed) return heroVideo;
    if (/youtube\.com\/embed\//i.test(heroVideo)) return heroVideo;
    const yt =
      heroVideo.match(/youtu\.be\/([^?&/]+)/i) ||
      heroVideo.match(/[?&]v=([^?&]+)/i) ||
      heroVideo.match(/youtube\.com\/shorts\/([^?&/]+)/i);
    if (yt?.[1]) {
      const start = heroVideo.match(/[?&](?:t|start)=(\d+)/i)?.[1];
      return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}${start ? `&start=${start}` : ""}`;
    }
    const vimeo = heroVideo.match(/vimeo\.com\/(\d+)/i);
    if (vimeo?.[1]) {
      return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1&loop=1`;
    }
    return heroVideo;
  })();

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    if (!heroVideo || isEmbed || reducedMotion) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    if (videoPaused) {
      video.pause();
      return;
    }
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        /* Autoplay may be blocked until user interaction */
      });
    }
  }, [heroVideo, isEmbed, reducedMotion, videoPaused]);

  return (
    <div className="w-full relative bg-[#F5F3EF]">
      <div className="relative overflow-hidden">
        <section className="bg-[#F5F3EF] px-3 pb-3 pt-[80px] sm:px-4 sm:pb-4 sm:pt-[84px]">
          <div className="relative w-full h-[80vh] sm:h-[calc(100vh-2rem)] overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
            {reducedMotion || (!heroVideo && heroPoster) ? (
              <Image
                src={heroPoster}
                alt=""
                fill
                priority
                className="absolute inset-0 z-0 h-full w-full object-cover object-[center_30%] sm:object-center"
                sizes="100vw"
              />
            ) : isEmbed ? (
              <iframe
                title="Hero video"
                src={embedSrc}
                className="absolute inset-0 z-0 h-full w-full pointer-events-none scale-[1.35] origin-center"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : heroVideo ? (
              <video
                key={heroVideo}
                ref={videoRef}
                autoPlay={!reducedMotion}
                muted
                loop
                playsInline
                preload="metadata"
                poster={heroPoster}
                src={heroVideo}
                onCanPlay={() => {
                  if (!videoPaused && !reducedMotion) {
                    videoRef.current?.play().catch(() => {});
                  }
                }}
                className="absolute inset-0 z-0 w-full h-full object-cover object-[center_28%] min-[480px]:object-[center_32%] sm:object-center pointer-events-none"
              />
            ) : null}

            <div className="absolute inset-0 bg-black/45" />

            {!reducedMotion && heroVideo && !isEmbed ? (
              <button
                type="button"
                onClick={() => setVideoPaused((prev) => !prev)}
                className="absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-transparent text-white backdrop-blur-[2px] transition hover:border-white/60 hover:bg-white/10"
                aria-pressed={videoPaused}
                aria-label={videoPaused ? "Play hero video" : "Pause hero video"}
              >
                {videoPaused ? (
                  <Play className="h-4 w-4 fill-white stroke-white" aria-hidden />
                ) : (
                  <Pause className="h-4 w-4 fill-white stroke-white" aria-hidden />
                )}
              </button>
            ) : null}

            <div className="absolute inset-0 z-10">
              <div className="max-w-[1440px] mx-auto h-full px-6 sm:px-8 lg:px-12">
                <div className="absolute bottom-14 lg:bottom-20 left-6 sm:left-8 lg:left-12 right-6 sm:right-8 lg:right-12 max-w-4xl">
                  <p className="uppercase tracking-[0.28em] text-[#C4A484] text-xs sm:text-sm font-medium mb-4">
                    {heroSubtitle}
                  </p>

                  <h1 className="text-white font-extrabold leading-tight text-lg min-[375px]:text-xl min-[425px]:text-2xl sm:text-2xl md:text-3xl lg:text-4xl tracking-wide uppercase break-words">
                    {heroTitle}
                  </h1>

                  <p className="mt-5 max-w-lg text-white/85 text-sm sm:text-base leading-7">
                    {heroDescription}
                  </p>

                  <Link
                    href="/contact"
                    className="mt-8 inline-flex items-center gap-2 bg-white text-[#1A1A1A] px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
                  >
                    {heroCta}
                    <span aria-hidden>↗</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <BrandSlider />

      <div className="relative overflow-hidden">
        <AboutSection />
        <CraftBar />

        <section className="pt-16 lg:pt-24 pb-10 lg:pb-12">
          <div className="max-w-7xl mx-auto px-6 flex items-end justify-between gap-6">
            <div>
              <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
                {productsEyebrow}
              </p>
              <h2 className="text-2xl min-[425px]:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A]">
                {productsTitle}
              </h2>
            </div>
            <Link
              href="/products"
              className="shrink-0 hidden sm:inline-flex gap-2 items-center bg-[#1A1A1A] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-black transition"
            >
              {productsCta}
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </section>
        <ProductSection initialProducts={initialProducts} />

        <section className="pt-10 lg:pt-12 pb-10 lg:pb-12">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
              {testimonialsEyebrow}
            </p>
            <h2 className="text-2xl min-[425px]:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A]">
              {testimonialsTitle}
            </h2>
          </div>
        </section>
        <TestimonialSection />

        <StatsSection />

        <section className="pt-10 lg:pt-12 pb-10 lg:pb-12">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
              {featuresEyebrow}
            </p>
            <h2 className="text-2xl min-[425px]:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A]">
              {featuresTitle}
            </h2>
          </div>
        </section>
        <FeatureSection />

        <section className="pt-10 lg:pt-12 pb-10 lg:pb-12">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
              {catalogEyebrow}
            </p>
            <h2 className="text-2xl min-[425px]:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A]">
              {catalogTitle}
            </h2>
          </div>
        </section>
        <CatalogSection initialCatalogues={initialCatalogues} />

        <HomeFaqSection />
        <ContactSection />
      </div>
    </div>
  );
}

export default HomePage;
