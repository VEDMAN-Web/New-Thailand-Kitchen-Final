"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";
import { useCmsSection } from "../../lib/CmsHomeContext";
import { pickCmsText } from "../../lib/cmsText";
import { fetchMergedFaqs } from "../../services/cmsPublic";
import { faqItems } from "./faqData";

type HomeFaqCms = {
  eyebrow?: unknown;
  title?: unknown;
  items?: { question?: unknown; answer?: unknown }[];
};

function AccordionRow({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#E5DED4]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-start justify-between gap-6 py-6 text-left"
        aria-expanded={open}
      >
        <span className="text-base sm:text-lg font-semibold text-[#1A1A1A] leading-7">
          {question}
        </span>
        <span
          className={`shrink-0 w-9 h-9 rounded-full border border-[#D8CFC3] flex items-center justify-center text-[#1A1A1A] text-xl leading-none transition-transform duration-300 ease-out ${
            open ? "rotate-45 bg-[#E0905A] border-[#E0905A] text-white" : ""
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-[#6B6B6B] text-sm sm:text-[15px] leading-7 max-w-3xl pr-12 pb-6">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Home-page FAQ — first 5 from Admin → FAQs (same source as /faq). */
export default function HomeFaqSection() {
  const { t, locale } = useTranslation();
  const faqCms = useCmsSection<HomeFaqCms>("faq");
  const [dedicatedFaqs, setDedicatedFaqs] = useState<
    { question: unknown; answer: unknown }[] | null
  >(null);

  useEffect(() => {
    let alive = true;
    fetchMergedFaqs()
      .then((items) => {
        if (!alive) return;
        setDedicatedFaqs(
          items.map((f) => ({ question: f.question, answer: f.answer }))
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const eyebrow = pickCmsText(
    faqCms?.eyebrow,
    t("home.faq.eyebrow"),
    locale
  );
  const title = pickCmsText(faqCms?.title, t("home.faq.title"), locale);

  const HOME_FAQ_LIMIT = 5;

  const items = useMemo(() => {
    const source =
      dedicatedFaqs && dedicatedFaqs.length
        ? dedicatedFaqs
        : (faqCms?.items || []).filter(
            (i) =>
              pickCmsText(i?.question, "", "EN") ||
              pickCmsText(i?.answer, "", "EN")
          );

    const mapped = source.length
      ? source.map((item, index) => ({
          id: `home-faq-${index}`,
          question: pickCmsText(
            item.question,
            t(`faq.q${index + 1}` as TranslationKey),
            locale
          ),
          answer: pickCmsText(
            item.answer,
            t(`faq.a${index + 1}` as TranslationKey),
            locale
          ),
        }))
      : faqItems.map((item) => ({
          id: `static-faq-${item.id}`,
          question: t(`faq.q${item.id}` as TranslationKey),
          answer: t(`faq.a${item.id}` as TranslationKey),
        }));
    return mapped.slice(0, HOME_FAQ_LIMIT);
  }, [dedicatedFaqs, faqCms, locale, t]);

  return (
    <section id="home-faq" className="bg-[#F5F3EF] pt-10 lg:pt-12 pb-16 lg:pb-20 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
          {eyebrow}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 lg:mb-10">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-[#1A1A1A]">
            {title}
          </h2>
          <Link
            href="/faq"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-[#1A1A1A] hover:text-[#E0905A] transition-colors"
          >
            {t("home.faq.viewAll")}
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="max-w-4xl">
          {items.map((item) => (
            <AccordionRow
              key={item.id}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
