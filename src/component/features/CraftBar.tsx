"use client";

import Image from "next/image";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";
import { useCmsSection } from "../../lib/CmsHomeContext";
import { pickCmsText } from "../../lib/cmsText";

const craftItems = [
  { id: "01", key: 1 },
  { id: "02", key: 2 },
  { id: "03", key: 3 },
  { id: "04", key: 4 },
] as const;

export default function CraftBar() {
  const { t, locale } = useTranslation();
  const transition = useCmsSection<{
    pillars?: { title?: string; description?: string; icon?: string }[];
  }>("transition");
  const pillars =
    transition?.pillars?.filter((p) => pickCmsText(p?.title, "", "EN")) || [];

  const items =
    pillars.length > 0
      ? pillars.map((p, i) => ({
          id: String(i + 1).padStart(2, "0"),
          title: pickCmsText(
            p.title,
            t(`home.craft.${i + 1}.title` as TranslationKey),
            locale
          ),
          desc: pickCmsText(
            p.description,
            t(`home.craft.${i + 1}.desc` as TranslationKey),
            locale
          ),
          icon: p.icon || "",
        }))
      : craftItems.map((item) => ({
          id: item.id,
          title: t(`home.craft.${item.key}.title` as TranslationKey),
          desc: t(`home.craft.${item.key}.desc` as TranslationKey),
          icon: "",
        }));

  return (
    <section className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-12">
        <div className="flex flex-col sm:flex-row items-stretch">
          {items.map((item, index) => {
            const remoteIcon =
              Boolean(item.icon) &&
              (item.icon.startsWith("http") ||
                item.icon.startsWith("/uploads"));
            return (
              <div
                key={item.id}
                className={`flex-1 py-5 sm:py-0 px-0 sm:px-6 lg:px-8 first:sm:pl-0 last:sm:pr-0 ${
                  index < items.length - 1
                    ? "border-b sm:border-b-0 sm:border-r border-[#5A5A5A]"
                    : ""
                }`}
              >
                <p className="text-[#B38B6D] text-xs tracking-[0.2em] mb-3">
                  {item.id}
                </p>
                {item.icon ? (
                  <div className="relative mb-3 h-8 w-8">
                    <Image
                      src={item.icon}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="32px"
                      unoptimized={remoteIcon}
                    />
                  </div>
                ) : null}
                <h3 className="text-base lg:text-lg font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-white/55 text-sm leading-6">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
