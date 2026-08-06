"use client";

import { useEffect, useState } from "react";
import { faqItems } from "./faqData";
import FaqItem from "./FaqItem";
import { fetchMergedFaqs, type CmsFaq } from "../../services/cmsPublic";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";
import { pickCmsText } from "../../lib/cmsText";

export default function FaqSection() {
  const { t, locale } = useTranslation();
  const [cmsItems, setCmsItems] = useState<CmsFaq[]>([]);

  useEffect(() => {
    let alive = true;
    fetchMergedFaqs().then((list: CmsFaq[]) => {
      if (!alive) return;
      if (list.length) setCmsItems(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  const items =
    cmsItems.length > 0
      ? cmsItems.map((item, index) => ({
          id: item.id ?? index + 1,
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
          id: item.id,
          question: t(`faq.q${item.id}` as TranslationKey),
          answer: t(`faq.a${item.id}` as TranslationKey),
        }));

  return (
    <section className="bg-[#F5F3EF] pb-20 lg:pb-28">
      <div className="max-w-4xl mx-auto px-6 pt-12 lg:pt-16">
        {items.map((item) => (
          <FaqItem key={String(item.id)} item={item as any} />
        ))}
      </div>
    </section>
  );
}
