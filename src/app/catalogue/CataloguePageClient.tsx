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

          {initialCatalogues.length === 0 ? (
            <p className="mt-10 text-sm text-[#6B6B6B]">{t("home.catalog.empty")}</p>
          ) : (
            <div className="mt-10 mx-auto grid max-w-3xl gap-8 sm:grid-cols-2">
              {initialCatalogues.map((entry, index) => {
                const coverImg = entry.image || "/catlog/catlog.png";
                const remote =
                  coverImg.startsWith("http") || coverImg.startsWith("/uploads");
                const cardTitle = pickCmsText(
                  entry.title,
                  t("catalogue.fileTitle"),
                  locale
                );
                const cardCategory = pickCmsText(
                  entry.category,
                  t("catalogue.edition"),
                  locale
                );
                const cardHref =
                  entry.pdfUrl ||
                  (entry.pdf ? `/catlog/${entry.pdf}` : "");
                const cardName =
                  entry.downloadName || "Thailand-Kitchens-Catalogue.pdf";
                return (
                  <div
                    key={entry.id ?? index}
                    className="rounded-[1.75rem] overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-left"
                  >
                    <div className="relative w-full aspect-[4/5]">
                      <Image
                        src={coverImg}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 320px"
                        unoptimized={remote}
                      />
                    </div>
                    <div className="p-6">
                      <p className="text-[11px] tracking-[0.18em] uppercase text-[#E0905A] font-semibold mb-1">
                        {cardCategory}
                      </p>
                      <h2 className="text-lg font-bold uppercase tracking-wide text-[#1A1A1A]">
                        {cardTitle}
                      </h2>
                      {cardHref ? (
                        <a
                          href={cardHref}
                          download={cardName}
                          target={cardHref.startsWith("http") ? "_blank" : undefined}
                          rel={
                            cardHref.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="mt-6 inline-flex items-center justify-center gap-2 w-full bg-[#1A1A1A] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-black transition"
                        >
                          <Download size={18} />
                          {t("catalogue.download")}
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
