"use client";

import FeatureCard from "./FeatureCard";
import { featureData } from "./featureData";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";
import { useCmsSection } from "../../lib/CmsHomeContext";

export default function FeatureSection() {
  const { t, locale } = useTranslation();
  const advantages = useCmsSection<{
    items?: { title?: string; description?: string }[];
  }>("advantages");
  const cmsItems = advantages?.items?.filter((i) => i?.title) || [];

  // CMS copy is English-only — fall back to i18n for other languages
  const items =
    locale === "EN" && cmsItems.length > 0
      ? cmsItems.map((item, index) => ({
          id: index + 1,
          title: item.title || "",
          description: item.description || "",
        }))
      : featureData.map((item) => ({
          id: item.id,
          title: t(`home.features.${item.id}.title` as TranslationKey),
          description: t(`home.features.${item.id}.desc` as TranslationKey),
        }));

  return (
    <section className="pb-6 lg:pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {items.map((item) => (
            <FeatureCard
              key={item.id}
              item={{
                title: item.title,
                description: item.description,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
