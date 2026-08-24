import type { Metadata } from "next";
import { fetchHomeSections } from "../../services/cmsPublic";
import { pickCmsText } from "../../lib/cmsText";
import { absoluteUrl, ogImageUrl } from "../../lib/siteUrl";
import { getServerLocale } from "../../lib/serverLocale";
import Breadcrumbs from "./Breadcrumbs";
import OverlayHeroBanner from "./OverlayHeroBanner";
import HubContentBlock from "./HubContentBlock";
import type { Locale } from "../../i18n/translations";
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
  kitchensSubKey?: KitchensSectionKey,
  locale: Locale = "EN"
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

  const cmsSections = kitchensSubKey
    ? (Array.isArray(sub?.sections) ? sub.sections : undefined)
    : Array.isArray(root.sections)
      ? root.sections
      : undefined;
  const sections = resolvePageSections(
    cmsSections,
    defaultHubSections(hubKey, kitchensSubKey)
  );

  return {
    config,
    title: pickCmsText(
      sub?.title || root.title,
      sectionMeta?.label || config.fallbackTitle,
      locale
    ),
    description: pickCmsText(
      sub?.description || root.description,
      sectionMeta?.description || config.fallbackDescription,
      locale
    ),
    eyebrow: pickCmsText(
      sub?.eyebrow || root.eyebrow,
      kitchensSubKey
        ? `Kitchens · ${sectionMeta?.label || ""}`
        : config.fallbackTitle,
      locale
    ),
    heroImage: String(
      sub?.heroImage || root.heroImage || "/products/Kitchen1.png"
    ).trim(),
    ctaLabel: pickCmsText(
      sub?.ctaLabel || root.ctaLabel,
      "Book a free consultation",
      locale
    ),
    ctaHref: String(sub?.ctaHref || root.ctaHref || "/contact").trim(),
    metaTitle: String(sub?.metaTitle || root.metaTitle || "").trim(),
    metaDescription: String(
      sub?.metaDescription || root.metaDescription || ""
    ).trim(),
    sections,
    currentHref: kitchensSubKey
      ? kitchensSectionByKey(kitchensSubKey)?.href || config.href
      : config.href,
  };
}

/** Shared Open Graph / Twitter Card metadata for every hub (and kitchens sub-hub) route. */
export async function generateHubMetadata(
  hubKey: HubNavKey,
  kitchensSubKey?: KitchensSectionKey
): Promise<Metadata> {
  const locale = await getServerLocale();
  const home = await fetchHomeSections().catch(() => ({}));
  const hubPages = (home as { hubPages?: Record<string, HubPageCms> })
    ?.hubPages;
  const data = resolveHubData(hubPages, hubKey, kitchensSubKey, locale);

  const title = data.metaTitle || `${data.title} | Thailand Kitchens`;
  const description = data.metaDescription || data.description;
  const canonical = absoluteUrl(data.currentHref);
  const image = ogImageUrl(data.heroImage);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: data.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function SeoHubLandingPage({
  hubKey,
  kitchensSubKey,
  breadcrumbTrail,
}: Props) {
  const locale = await getServerLocale();
  const home = await fetchHomeSections().catch(() => ({}));
  const hubPages = (home as { hubPages?: Record<string, HubPageCms> })
    ?.hubPages;
  const data = resolveHubData(hubPages, hubKey, kitchensSubKey, locale);

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

      <OverlayHeroBanner
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
        image={data.heroImage}
        ctaLabel={data.ctaLabel}
        ctaHref={data.ctaHref}
      />

      {data.sections.length > 0 ? (
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-16 lg:py-20 space-y-8 sm:space-y-14 lg:space-y-24">
          {data.sections.map((block, index) => (
            <HubContentBlock
              key={index}
              block={block}
              index={index}
              hubHref={kitchensSubKey ? undefined : data.config.href}
              locale={locale}
            />
          ))}
        </div>
      ) : null}
    </main>
  );
}
