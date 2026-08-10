"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  galleryItems,
  galleryCategories,
  type GalleryCategory,
} from "./galleryData";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";
import type { CmsGallery } from "../../services/cmsPublic";
import { pickCmsText } from "../../lib/cmsText";

const categoryKeyMap: Record<GalleryCategory, TranslationKey> = {
  All: "gallery.filter.all",
  "Layout & Space": "gallery.filter.layout",
  Storage: "gallery.filter.storage",
  "Style & Color": "gallery.filter.style",
  Materials: "gallery.filter.materials",
};

function categoryToSlug(cat: string) {
  return cat
    .toLowerCase()
    .replace(/\s*&\s*/g, "-")
    .replace(/\s+/g, "-");
}

type Props = {
  initialItems?: CmsGallery[];
  initialFilters?: { id: string; label: unknown }[];
};

export default function GalleryContent({ initialItems, initialFilters }: Props) {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const [active, setActive] = useState<string>("All");

  // Use SSR data directly — no useEffect fetch, no flicker
  const itemsAll = initialItems?.length ? initialItems : galleryItems;

  const filters =
    initialFilters && initialFilters.length > 0
      ? initialFilters.map((f) => ({
          id: f.id,
          label: pickCmsText(
            f.label,
            f.id in categoryKeyMap
              ? t(categoryKeyMap[f.id as GalleryCategory])
              : f.id,
            locale
          ),
        }))
      : galleryCategories.map((id) => ({
          id,
          label:
            id in categoryKeyMap
              ? t(categoryKeyMap[id as GalleryCategory])
              : id,
        }));

  useEffect(() => {
    const raw = searchParams.get("tab") || searchParams.get("filter") || "";
    if (!raw) return;
    const normalized = raw
      .toLowerCase()
      .replace(/[_\s]+/g, "-")
      .replace(/-+/g, "-");
    const match = filters.find((f) => categoryToSlug(f.id) === normalized);
    if (match) setActive(match.id);
  }, [searchParams, filters]);

  const items =
    active === "All"
      ? itemsAll
      : itemsAll.filter((item) => item.filter === active);

  return (
    <section className="pb-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-8 lg:mb-10">
          {filters.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActive(cat.id);
                const url = new URL(window.location.href);
                url.searchParams.set("tab", categoryToSlug(cat.id));
                window.history.replaceState({}, "", url.toString());
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                active === cat.id
                  ? "bg-[#1A1A1A] text-white"
                  : "text-[#4A4A4A] hover:text-[#1A1A1A]"
              }`}
            >
              {cat.label ||
                (cat.id in categoryKeyMap
                  ? t(categoryKeyMap[cat.id as GalleryCategory])
                  : cat.id)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 auto-rows-[150px] sm:auto-rows-[190px] lg:auto-rows-[215px] [grid-auto-flow:dense]">
          {items.map((item, i) => {
            const pos = i % 7;
            const isTall = Boolean(item.tall) || pos === 0 || pos === 4;
            const isWide = Boolean(item.wide) || pos === 6;

            const panClass =
              isTall || isWide
                ? "scale-[1.3] origin-left transition-transform duration-[3500ms] ease-linear will-change-transform group-hover:-translate-x-[14%]"
                : "scale-[1.3] origin-top transition-transform duration-[3500ms] ease-linear will-change-transform group-hover:-translate-y-[14%]";

            return (
              <article
                key={String(item.id)}
                className={`group relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] ${
                  isTall ? "row-span-2" : ""
                } ${isWide ? "col-span-2 row-span-2" : ""}`}
              >
                <Image
                  src={item.image}
                  alt={pickCmsText(item.title, "Gallery", locale)}
                  fill
                  className={`object-cover ${panClass}`}
                  sizes={isWide ? "100vw" : "(max-width: 1024px) 50vw, 45vw"}
                  unoptimized={
                    item.image.startsWith("/uploads") ||
                    item.image.startsWith("http")
                  }
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
