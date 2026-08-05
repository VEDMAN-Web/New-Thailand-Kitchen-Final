"use client";

import { useEffect, useState } from "react";
import { faqItems } from "./faqData";
import FaqItem from "./FaqItem";
import { fetchMergedFaqs, type CmsFaq } from "../../services/cmsPublic";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function FaqSection() {
  const { locale } = useTranslation();
  const [cmsItems, setCmsItems] = useState<CmsFaq[]>([]);

  useEffect(() => {
    fetchMergedFaqs().then((list: CmsFaq[]) => {
      if (list.length) setCmsItems(list);
    });
  }, []);

  // CMS FAQ copy is English-only — use i18n keys for TH/PL
  const items =
    locale === "EN" && cmsItems.length > 0 ? cmsItems : faqItems;

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
