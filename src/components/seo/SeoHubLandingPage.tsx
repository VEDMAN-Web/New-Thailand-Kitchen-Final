import { fetchHomeSections } from "../../services/cmsPublic";
import { pickCmsText } from "../../lib/cmsText";
import Breadcrumbs from "./Breadcrumbs";
import OverlayHeroBanner from "./OverlayHeroBanner";
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

      <OverlayHeroBanner
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
        image={data.heroImage}
        ctaLabel={data.ctaLabel}
        ctaHref={data.ctaHref}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16 lg:py-20 space-y-14 lg:space-y-24">
        {data.sections.map((block, index) => (
          <HubContentBlock
            key={index}
            block={block}
            index={index}
            hubHref={kitchensSubKey ? undefined : data.config.href}
          />
        ))}
      </div>
    </main>
  );
}
