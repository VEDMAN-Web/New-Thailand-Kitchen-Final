import Image from "next/image";
import Link from "next/link";
import { pickCmsText } from "../../lib/cmsText";
import type { CmsCategory } from "../../services/cmsPublic";
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
};

function heroTone(categoryType?: string) {
  switch (categoryType) {
    case "material":
      return { soft: "#F3EEE6", accent: "#B38B6D", label: "Material story" };
    case "service":
      return { soft: "#EEF2F6", accent: "#1A2332", label: "Service" };
    case "layout":
      return { soft: "#F0F4EF", accent: "#2D6A4F", label: "Layout" };
    case "style":
      return { soft: "#F7F1EC", accent: "#8B5E3C", label: "Style" };
    case "property-type":
      return { soft: "#F5F3EF", accent: "#3D5A80", label: "Property" };
    case "location":
      return { soft: "#EEF6F2", accent: "#2D6A4F", label: "Location" };
    case "built-in-furniture":
      return { soft: "#F4F0EB", accent: "#1A2332", label: "Built-in" };
    default:
      return { soft: "#FAF8F5", accent: "#B38B6D", label: "Explore" };
  }
}

export default function CategoryLandingView({
  category,
  related,
  sectionLabel,
}: Props) {
  const title = pickCmsText(category.title, sectionLabel, "EN");
  const description = pickCmsText(category.description, "", "EN");
  const image = String(category.image || "").trim() || "/products/Kitchen2.png";
  const eyebrow = pickCmsText(category.eyebrow, sectionLabel, "EN");
  const ctaLabel = pickCmsText(
    category.ctaLabel,
    "Request a consultation",
    "EN"
  );
  const ctaHref = String(category.ctaHref || "/contact").trim() || "/contact";
  const footerHeading = pickCmsText(
    category.footerCtaHeading,
    `Ready to plan your ${title.toLowerCase()}?`,
    "EN"
  );
  const footerBody = pickCmsText(
    category.footerCtaBody,
    "Speak with our design team for a free consultation and tailored quote.",
    "EN"
  );
  const tone = heroTone(category.categoryType);
  const type = String(category.categoryType || "");

  const paragraphs = description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const sections = resolvePageSections(
    (category.sections || []) as ContentSectionBlock[],
    defaultCategorySections({
      title,
      description,
      image,
      categoryType: category.categoryType,
      slug: category.slug,
    })
  );

  const isMaterial = type === "material";
  const isService = type === "service";
  const isStyle = type === "style";

  return (
    <>
      {isMaterial ? (
        <section className="relative min-h-[70vh] flex items-end">
          <Image
            src={image}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized={image.startsWith("/uploads") || image.startsWith("http")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A2332]/90 via-[#1A2332]/35 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-6 pb-12 sm:pb-16 pt-32">
            <p className="text-[#D4B896] text-xs tracking-[0.22em] uppercase font-semibold mb-3">
              {eyebrow}
            </p>
            <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl text-white leading-tight max-w-3xl">
              {title}
            </h1>
            {paragraphs[0] ? (
              <p className="mt-4 max-w-xl text-white/80 text-sm sm:text-base leading-7">
                {paragraphs[0]}
              </p>
            ) : null}
            <Link
              href={ctaHref}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1A2332] hover:bg-[#F5F3EF] transition"
            >
              {ctaLabel}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      ) : isService ? (
        <section style={{ backgroundColor: tone.soft }} className="border-b border-[#E8E4DC]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16 lg:py-20">
            <div className="max-w-3xl">
              <p
                className="text-xs tracking-[0.22em] uppercase font-semibold mb-3"
                style={{ color: tone.accent }}
              >
                {eyebrow}
              </p>
              <h1 className="font-sans text-4xl sm:text-5xl text-[#1A2332] leading-tight">
                {title}
              </h1>
              {paragraphs[0] ? (
                <p className="mt-5 text-[#5C6370] text-base leading-8">
                  {paragraphs[0]}
                </p>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1A2332] px-6 py-3 text-sm font-semibold text-white hover:bg-[#243044] transition"
                >
                  {ctaLabel}
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 rounded-full border border-[#D8D2C8] bg-white px-6 py-3 text-sm font-semibold text-[#1A2332] hover:bg-[#FAF8F5] transition"
                >
                  View projects
                </Link>
              </div>
            </div>
            <div className="relative mt-10 aspect-[21/9] rounded-2xl overflow-hidden bg-[#E8E4DC]">
              <Image
                src={image}
                alt={title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
                unoptimized={
                  image.startsWith("/uploads") || image.startsWith("http")
                }
              />
            </div>
          </div>
        </section>
      ) : isStyle ? (
        <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
          <div
            className="flex flex-col justify-center px-5 sm:px-10 lg:px-14 py-14"
            style={{ backgroundColor: tone.soft }}
          >
            <p
              className="text-xs tracking-[0.22em] uppercase font-semibold mb-3"
              style={{ color: tone.accent }}
            >
              {eyebrow}
            </p>
            <h1 className="font-sans text-4xl sm:text-5xl text-[#1A2332] leading-tight">
              {title}
            </h1>
            {paragraphs[0] ? (
              <p className="mt-5 text-[#5C6370] text-base leading-8 max-w-lg">
                {paragraphs[0]}
              </p>
            ) : null}
            <Link
              href={ctaHref}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-[#1A2332] px-6 py-3 text-sm font-semibold text-white hover:bg-[#243044] transition"
            >
              {ctaLabel}
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="relative min-h-[320px] lg:min-h-full">
            <Image
              src={image}
              alt={title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={
                image.startsWith("/uploads") || image.startsWith("http")
              }
            />
          </div>
        </section>
      ) : (
        <section
          className="border-b border-[#E8E4DC]"
          style={{ backgroundColor: tone.soft }}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p
                className="text-xs tracking-[0.22em] uppercase font-semibold mb-3"
                style={{ color: tone.accent }}
              >
                {eyebrow}
              </p>
              <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl text-[#1A2332] leading-tight">
                {title}
              </h1>
              {paragraphs[0] ? (
                <p className="mt-4 sm:mt-5 text-[#5C6370] text-sm sm:text-base leading-7 sm:leading-8">
                  {paragraphs[0]}
                </p>
              ) : null}
              <Link
                href={ctaHref}
                className="mt-7 sm:mt-8 inline-flex items-center gap-2 rounded-full bg-[#1A2332] px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-[#243044] transition"
              >
                {ctaLabel}
                <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl sm:rounded-[1.75rem] overflow-hidden shadow-[0_20px_50px_rgba(26,35,50,0.12)] bg-[#E8E4DC]">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={
                  image.startsWith("/uploads") || image.startsWith("http")
                }
              />
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16 lg:py-20 space-y-14 lg:space-y-24">
        {sections.map((block, index) => (
          <HubContentBlock key={index} block={block} index={index} />
        ))}
      </div>

      <RelatedProjects items={related} />

      <section className="bg-[#1A2332] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-14 lg:py-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
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
