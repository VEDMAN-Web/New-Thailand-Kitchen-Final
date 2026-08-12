"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { CmsCatalogue } from "../../services/cmsPublic";
import { pickCmsText } from "../../lib/cmsText";
import { useCmsSection } from "../../lib/CmsHomeContext";

type CatalogueCms = {
  pageEyebrow?: unknown;
  pageTitle?: unknown;
  pageDescription?: unknown;
  eyebrow?: unknown;
  title?: unknown;
};

export default function CataloguePageClient({
  initialCatalogues,
}: {
  initialCatalogues: CmsCatalogue[];
}) {
  const { t, locale } = useTranslation();
  const cms = useCmsSection<CatalogueCms>("catalogue");

  const item = initialCatalogues[0] ?? null;

  const cover = item?.image || "/catlog/catlog.png";
  const remoteCover =
    cover.startsWith("http") || cover.startsWith("/uploads");
  const title = pickCmsText(item?.title, t("catalogue.fileTitle"), locale);
  const category = pickCmsText(item?.category, t("catalogue.edition"), locale);
  const pageEyebrow = pickCmsText(
    cms?.pageEyebrow || cms?.eyebrow,
    t("catalogue.eyebrow"),
    locale
  );
  const pageTitle = pickCmsText(
    cms?.pageTitle || cms?.title,
    t("catalogue.title"),
    locale
  );
  const pageDescription = pickCmsText(
    cms?.pageDescription,
    t("catalogue.description"),
    locale
  );
  const href =
    item?.pdfUrl ||
    (item?.pdf ? `/catlog/${item.pdf}` : "/catlog/catalogue.pdf");
  const downloadName =
    item?.downloadName || "Thailand-Kitchens-Catalogue.pdf";

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF]">
      <section className="pt-[80px] sm:pt-[84px] pb-16 lg:pb-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
            {pageEyebrow}
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A]">
            {pageTitle}
          </h1>
          <p className="mt-5 text-[#6B6B6B] text-sm sm:text-base leading-7 max-w-xl mx-auto">
            {pageDescription}
          </p>

          <div className="mt-10 mx-auto max-w-md rounded-[1.75rem] overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
            <div className="relative w-full aspect-[4/5]">
              <Image
                src={cover}
                alt="Catalogue cover"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
                priority
                unoptimized={remoteCover}
              />
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-[11px] tracking-[0.18em] uppercase text-[#E0905A] font-semibold mb-1">
                {category}
              </p>
              <h2 className="text-lg font-bold uppercase tracking-wide text-[#1A1A1A]">
                {title}
              </h2>
              <a
                href={href}
                download={downloadName}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="mt-6 inline-flex items-center justify-center gap-2 w-full bg-[#1A1A1A] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-black transition"
              >
                <Download size={18} />
                {t("catalogue.download")}
              </a>
              <p className="mt-3 text-xs text-[#9A9A9A]">
                {t("catalogue.note")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
