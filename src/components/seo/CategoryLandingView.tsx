import Link from "next/link";
import { pickCmsText } from "../../lib/cmsText";
import { resolveCmsMediaUrl } from "../../lib/cmsMedia";
import type { CmsCategory } from "../../services/cmsPublic";
import type { Locale } from "../../i18n/translations";
import OverlayHeroBanner from "./OverlayHeroBanner";
import HubContentBlock, {
  type ContentSectionBlock,
} from "./HubContentBlock";
import RelatedProjects, {
  type RelatedProjectItem,
} from "./RelatedProjects";
import {
  defaultCategorySections,
  resolvePageSections,
} from "../../lib/pageSectionDefaults";

type Props = {
  category: CmsCategory;
  related: RelatedProjectItem[];
  sectionLabel: string;
  locale?: Locale;
};

export default function CategoryLandingView({
  category,
  related,
  sectionLabel,
  locale = "EN",
}: Props) {
  const title = pickCmsText(category.title, sectionLabel, locale);
  const description = pickCmsText(category.description, "", locale);
  const image = resolveCmsMediaUrl(category.image, "/products/Kitchen2.png");
  const eyebrow = pickCmsText(category.eyebrow, sectionLabel, locale);
  const ctaLabel = pickCmsText(
    category.ctaLabel,
    "Request a consultation",
    locale
  );
  const ctaHref = String(category.ctaHref || "/contact").trim() || "/contact";
  const footerHeading = pickCmsText(
    category.footerCtaHeading,
    `Ready to plan your ${title.toLowerCase()}?`,
    locale
  );
  const footerBody = pickCmsText(
    category.footerCtaBody,
    "Speak with our design team for a free consultation and tailored quote.",
    locale
  );
  const paragraphs = description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const sections = resolvePageSections(
    Array.isArray(category.sections)
      ? (category.sections as ContentSectionBlock[])
      : undefined,
    defaultCategorySections({
      title,
      description,
      image,
      categoryType: category.categoryType,
      slug: category.slug,
    })
  );

  return (
    <>
      <OverlayHeroBanner
        eyebrow={eyebrow}
        title={title}
        description={paragraphs[0] || ""}
        image={image}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
      />

      {sections.length > 0 ? (
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-16 lg:py-20 space-y-8 sm:space-y-14 lg:space-y-24">
          {sections.map((block, index) => (
            <HubContentBlock key={index} block={block} index={index} locale={locale} />
          ))}
        </div>
      ) : null}

      <RelatedProjects items={related} locale={locale} />

      <section className="bg-[#1A2332] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-14 lg:py-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div>
            <h2 className="text-2xl min-[425px]:text-3xl md:text-4xl lg:text-5xl font-extrabold break-words">
              {footerHeading}
            </h2>
            <p className="mt-2 text-white/70 max-w-lg text-sm sm:text-base">
              {footerBody}
            </p>
          </div>
          <Link
            href={ctaHref}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1A2332] hover:bg-[#F5F3EF] transition"
          >
            {ctaLabel}
          </Link>
        </div>
      </section>
    </>
  );
}
