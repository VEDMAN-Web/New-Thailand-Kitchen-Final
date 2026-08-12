import Image from "next/image";
import Link from "next/link";
import { fetchHomeSections } from "../../services/cmsPublic";
import { pickCmsText } from "../../lib/cmsText";
import Breadcrumbs from "./Breadcrumbs";
import HubContentBlock from "./HubContentBlock";
import {
  hubNavByKey,
  type HubNavKey,
  type HubPageCms,
} from "../../lib/hubNavigation";
import type { KitchensSectionKey } from "../kitchens/kitchensConfig";
import { kitchensSectionByKey } from "../kitchens/kitchensConfig";
import {
  defaultHubSections,
  resolvePageSections,
} from "../../lib/pageSectionDefaults";

type Props = {
  hubKey: HubNavKey;
  /** When set, renders a kitchens sub-hub (layouts / styles / by-property). */
  kitchensSubKey?: KitchensSectionKey;
  breadcrumbTrail?: { label: string; href: string }[];
};

function resolveHubData(
  hubPages: Record<string, HubPageCms> | undefined,
  hubKey: HubNavKey,
  kitchensSubKey?: KitchensSectionKey
) {
  const config = hubNavByKey(hubKey);
  const root = hubPages?.[hubKey] || {};
  const sub =
    kitchensSubKey && hubKey === "kitchens"
      ? root.subsections?.[kitchensSubKey]
      : undefined;
  const sectionMeta = kitchensSubKey
    ? kitchensSectionByKey(kitchensSubKey)
    : null;

  const cmsSections = (sub?.sections?.length ? sub.sections : root.sections) || [];
  const sections = resolvePageSections(
    cmsSections,
    defaultHubSections(hubKey, kitchensSubKey)
  );

  return {
    config,
    title: pickCmsText(
      sub?.title || root.title,
      sectionMeta?.label || config.fallbackTitle,
      "EN"
    ),
    description: pickCmsText(
      sub?.description || root.description,
      sectionMeta?.description || config.fallbackDescription,
      "EN"
    ),
    eyebrow: pickCmsText(
      sub?.eyebrow || root.eyebrow,
      kitchensSubKey
        ? `Kitchens · ${sectionMeta?.label || ""}`
        : config.fallbackTitle,
      "EN"
    ),
    heroImage: String(
      sub?.heroImage || root.heroImage || "/products/Kitchen1.png"
    ).trim(),
    ctaLabel: pickCmsText(
      sub?.ctaLabel || root.ctaLabel,
      "Book a free consultation",
      "EN"
    ),
    ctaHref: String(sub?.ctaHref || root.ctaHref || "/contact").trim(),
    sections,
    accent: sectionMeta?.accent || config.accent,
    accentSoft: sectionMeta?.accentSoft || "#FAF8F5",
    currentHref: kitchensSubKey
      ? kitchensSectionByKey(kitchensSubKey)?.href || config.href
      : config.href,
  };
}

export default async function SeoHubLandingPage({
  hubKey,
  kitchensSubKey,
  breadcrumbTrail,
}: Props) {
  const home = await fetchHomeSections().catch(() => ({}));
  const hubPages = (home as { hubPages?: Record<string, HubPageCms> })
    ?.hubPages;
  const data = resolveHubData(hubPages, hubKey, kitchensSubKey);

  const trail =
    breadcrumbTrail ||
    (kitchensSubKey
      ? [
          { label: "Home", href: "/" },
          { label: "Kitchens", href: "/kitchens" },
        ]
      : [{ label: "Home", href: "/" }]);

  return (
    <main className="w-full bg-[#F5F3EF] min-h-[50vh]">
      <Breadcrumbs
        items={trail}
        currentPage={data.title}
        currentHref={data.currentHref}
      />

      {hubKey === "materials" && !kitchensSubKey ? (
        <section className="relative min-h-[62vh] flex items-end">
          {data.heroImage ? (
            <Image
              src={data.heroImage}
              alt={data.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
              unoptimized={
                data.heroImage.startsWith("/uploads") ||
                data.heroImage.startsWith("http")
              }
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A2332]/90 via-[#1A2332]/30 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-6 pb-12 sm:pb-16 pt-28">
            <p className="text-[#D4B896] text-xs tracking-[0.22em] uppercase font-semibold mb-3">
              {data.eyebrow}
            </p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl md:text-6xl text-white leading-tight max-w-3xl">
              {data.title}
            </h1>
            <p className="mt-4 max-w-xl text-white/80 text-sm sm:text-base leading-7">
              {data.description}
            </p>
            <Link
              href={data.ctaHref}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1A2332] hover:bg-[#F5F3EF] transition"
            >
              {data.ctaLabel}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      ) : hubKey === "services" && !kitchensSubKey ? (
        <section
          className="border-b border-[#E8E4DC]"
          style={{ backgroundColor: data.accentSoft }}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16 lg:py-20">
            <div className="max-w-3xl">
              <p
                className="text-xs tracking-[0.22em] uppercase font-semibold mb-3"
                style={{ color: data.accent }}
              >
                {data.eyebrow}
              </p>
              <h1 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl text-[#1A2332] leading-tight">
                {data.title}
              </h1>
              <p className="mt-5 text-[#5C6370] text-base leading-8">
                {data.description}
              </p>
              <Link
                href={data.ctaHref}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1A2332] px-6 py-3 text-sm font-semibold text-white hover:bg-[#243044] transition"
              >
                {data.ctaLabel}
                <span aria-hidden>→</span>
              </Link>
            </div>
            {data.heroImage ? (
              <div className="relative mt-10 aspect-[21/9] rounded-2xl overflow-hidden bg-[#E8E4DC]">
                <Image
                  src={data.heroImage}
                  alt={data.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                  unoptimized={
                    data.heroImage.startsWith("/uploads") ||
                    data.heroImage.startsWith("http")
                  }
                />
              </div>
            ) : null}
          </div>
        </section>
      ) : hubKey === "locations" && !kitchensSubKey ? (
        <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
          <div
            className="flex flex-col justify-center px-5 sm:px-10 lg:px-14 py-14"
            style={{ backgroundColor: data.accentSoft }}
          >
            <p
              className="text-xs tracking-[0.22em] uppercase font-semibold mb-3"
              style={{ color: data.accent }}
            >
              {data.eyebrow}
            </p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl text-[#1A2332] leading-tight">
              {data.title}
            </h1>
            <p className="mt-5 text-[#5C6370] text-base leading-8 max-w-lg">
              {data.description}
            </p>
            <Link
              href={data.ctaHref}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-[#1A2332] px-6 py-3 text-sm font-semibold text-white hover:bg-[#243044] transition"
            >
              {data.ctaLabel}
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="relative min-h-[280px] lg:min-h-full bg-[#E8E4DC]">
            {data.heroImage ? (
              <Image
                src={data.heroImage}
                alt={data.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={
                  data.heroImage.startsWith("/uploads") ||
                  data.heroImage.startsWith("http")
                }
              />
            ) : null}
          </div>
        </section>
      ) : (
        <section
          className="border-b border-[#E8E4DC]"
          style={{ backgroundColor: data.accentSoft }}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p
                className="text-xs tracking-[0.22em] uppercase font-semibold mb-3"
                style={{ color: data.accent }}
              >
                {data.eyebrow}
              </p>
              <h1 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-[#1A2332] leading-tight">
                {data.title}
              </h1>
              <p className="mt-4 sm:mt-5 text-[#5C6370] text-sm sm:text-base leading-7 sm:leading-8 max-w-xl">
                {data.description}
              </p>
              <Link
                href={data.ctaHref}
                className="mt-7 sm:mt-8 inline-flex items-center gap-2 rounded-full bg-[#1A2332] px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-[#243044] transition"
              >
                {data.ctaLabel}
                <span aria-hidden>→</span>
              </Link>
            </div>
            {data.heroImage ? (
              <div className="relative aspect-[4/3] rounded-2xl sm:rounded-[1.75rem] overflow-hidden shadow-[0_20px_50px_rgba(26,35,50,0.12)]">
                <Image
                  src={data.heroImage}
                  alt={data.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized={
                    data.heroImage.startsWith("/uploads") ||
                    data.heroImage.startsWith("http")
                  }
                />
              </div>
            ) : null}
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16 lg:py-20 space-y-14 lg:space-y-24">
        {data.sections.map((block, index) => (
          <HubContentBlock key={index} block={block} index={index} />
        ))}
      </div>
    </main>
  );
}
