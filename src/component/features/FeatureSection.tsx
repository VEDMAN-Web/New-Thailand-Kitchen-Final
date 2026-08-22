"use client";

import FeatureCard from "./FeatureCard";
import { featureData } from "./featureData";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";
import { useCmsSection } from "../../lib/CmsHomeContext";
import { pickCmsText } from "../../lib/cmsText";

export default function FeatureSection() {
  const { t, locale } = useTranslation();
  const advantages = useCmsSection<{
    items?: { title?: string; description?: string; icon?: string }[];
  }>("advantages");
  const cmsItems =
    advantages?.items?.filter((i) => pickCmsText(i?.title, "", "EN")) || [];

  const items =
    cmsItems.length > 0
      ? cmsItems.map((item, index) => ({
          id: index + 1,
          title: pickCmsText(
            item.title,
            t(`home.features.${index + 1}.title` as TranslationKey),
            locale
          ),
          description: pickCmsText(
            item.description,
            t(`home.features.${index + 1}.desc` as TranslationKey),
            locale
          ),
          icon: item.icon || "",
        }))
      : featureData.map((item) => ({
          id: item.id,
          title: t(`home.features.${item.id}.title` as TranslationKey),
          description: t(`home.features.${item.id}.desc` as TranslationKey),
          icon: "",
        }));

  return (
    <section className="pb-6 lg:pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
          {items.map((item) => (
            <FeatureCard
              key={item.id}
              item={{
                title: item.title,
                description: item.description,
                icon: item.icon,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
