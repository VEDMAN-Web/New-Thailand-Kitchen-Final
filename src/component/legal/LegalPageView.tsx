"use client";

import { useEffect, useState } from "react";
import {
  type LegalPageContent,
  type LegalSection,
} from "./legalData";
import { fetchLegalPage } from "../../services/cmsPublic";
import { useTranslation } from "../../i18n/LanguageProvider";
import { pickCmsText } from "../../lib/cmsText";

export default function LegalPageView({
  type,
  fallback,
}: {
  type: "privacy" | "terms";
  fallback: LegalPageContent;
}) {
  const { locale } = useTranslation();
  const [raw, setRaw] = useState<{
    title?: unknown;
    subtitle?: unknown;
    updatedLabel?: unknown;
    sections?: { title?: unknown; body?: unknown }[];
    content?: unknown;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    fetchLegalPage(type).then((page) => {
      if (!alive || !page) return;
      setRaw(page as any);
    });
    return () => {
      alive = false;
    };
  }, [type]);

  const title = pickCmsText(
    raw?.title,
    fallback.title,
    locale
  ).toUpperCase();
  const subtitle = pickCmsText(raw?.subtitle, fallback.subtitle, locale);
  const updatedRaw = pickCmsText(raw?.updatedLabel, fallback.updated, locale);
  const updated = updatedRaw.toLowerCase().startsWith("last updated")
    ? updatedRaw
    : `Last Updated: ${updatedRaw}`;

  const sections: LegalSection[] =
    raw?.sections && raw.sections.length
      ? raw.sections.map((s) => ({
          title: pickCmsText(s.title, "", locale),
          body: pickCmsText(s.body, "", locale),
        }))
      : fallback.sections;

  return (
    <div className="min-h-screen bg-[#F7F4EF]">
      <main className="pt-[88px] sm:pt-[96px] pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs tracking-[0.2em] uppercase text-[#E0905A] font-semibold">
            {updated}
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-[#1A1A1A]">
            {title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#6B6B6B] leading-7">
            {subtitle}
          </p>
          <div className="mt-10 space-y-8">
            {sections.map((section, index) => (
              <section key={`${section.title}-${index}`}>
                <h2 className="text-lg font-bold text-[#1A1A1A]">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm text-[#5A5A5A] leading-7 whitespace-pre-line">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
