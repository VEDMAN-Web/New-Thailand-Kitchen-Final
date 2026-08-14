"use client";

import FaqItem from "./FaqItem";
import type { CmsFaq } from "../../services/cmsPublic";
import { useTranslation } from "../../i18n/LanguageProvider";
import { pickCmsText } from "../../lib/cmsText";

export default function FaqSection({ initialFaqs }: { initialFaqs?: CmsFaq[] }) {
  const { locale } = useTranslation();

  const fromCms = (initialFaqs || [])
    .map((item, index) => ({
      id: item.id ?? index + 1,
      question: pickCmsText(item.question, "", locale),
      answer: pickCmsText(item.answer, "", locale),
    }))
    .filter((item) => item.question || item.answer);

  const items = fromCms;

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
