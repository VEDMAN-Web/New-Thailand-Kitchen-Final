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
import { isSamuiLocation, SAMUI_KITCHENS_ORIGIN } from "../../lib/pageMetadata";
import { fixedCategoryImage, isMediaWallSlug } from "../../lib/imageFixRegister";

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
  const rawImage = resolveCmsMediaUrl(category.image, "/products/Kitchen2.png");
  const image = fixedCategoryImage(String(category.slug || ""), rawImage);
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
  ).map((block) => ({
    ...block,
    image: block.image
      ? fixedCategoryImage(String(category.slug || ""), String(block.image))
      : block.image,
  }));

  const heroDescription = isMediaWallSlug(String(category.slug || ""))
    ? paragraphs[0] ||
      "Built-in TV walls, cable access, and equipment cupboards designed to the room."
    : paragraphs[0] || "";

  return (
    <>
      <OverlayHeroBanner
        eyebrow={eyebrow}
        title={title}
        description={heroDescription}
        image={image}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
      />

      {isSamuiLocation(String(category.slug || ""), title) ? (
        <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-8">
          <p className="text-sm sm:text-base text-[#5C6370] leading-7 max-w-3xl">
            Thailand Kitchens covers Koh Samui as part of our national kitchen
            design service. For local Koh Samui showroom detail, visit{" "}
            <a
              href={SAMUI_KITCHENS_ORIGIN}
              className="font-semibold text-[#1A2332] underline underline-offset-4 hover:text-[#B38B6D]"
            >
              Samui Kitchens
            </a>
            .
          </p>
        </div>
      ) : null}

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
