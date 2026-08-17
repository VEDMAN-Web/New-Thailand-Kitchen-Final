"use client";

import { useEffect, useMemo, useState } from "react";
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
import CmsResolvedImage from "../CmsResolvedImage";

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

  const items = useMemo(() => {
    const list =
      active === "All"
        ? itemsAll
        : itemsAll.filter((item) => {
            if (item.filter === active) return true;
            const cms = item as CmsGallery;
            const tags = [
              cms.locationTag,
              cms.layoutTag,
              cms.styleTag,
              cms.materialTag,
              cms.propertyType,
            ]
              .filter(Boolean)
              .map((tag) => String(tag).toLowerCase());
            const needle = active.toLowerCase();
            return tags.some(
              (tag) =>
                tag === needle ||
                tag.includes(needle) ||
                needle.includes(tag)
            );
          });

    return [...list].sort((a, b) => {
      const ao = Number(a.sortOrder) || 0;
      const bo = Number(b.sortOrder) || 0;
      return ao - bo;
    });
  }, [active, itemsAll]);

  return (
    <section className="pb-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-8 lg:mb-10">
          {filters.map((cat) => {
            const count =
              cat.id === "All"
                ? itemsAll.length
                : itemsAll.filter((item) => {
                    if (item.filter === cat.id) return true;
                    const cms = item as CmsGallery;
                    const tags = [
                      cms.locationTag,
                      cms.layoutTag,
                      cms.styleTag,
                      cms.materialTag,
                      cms.propertyType,
                    ]
                      .filter(Boolean)
                      .map((tag) => String(tag).toLowerCase());
                    const needle = cat.id.toLowerCase();
                    return tags.some(
                      (tag) =>
                        tag === needle ||
                        tag.includes(needle) ||
                        needle.includes(tag)
                    );
                  }).length;

            return (
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
                <span
                  className={`ml-1.5 text-[11px] ${
                    active === cat.id ? "text-white/70" : "text-[#9CA3AF]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {items.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#6B7280]">
            No gallery images in this filter yet.
          </p>
        ) : (
          /* CSS multi-column masonry — no empty grid holes */
          <div className="columns-2 lg:columns-3 gap-4 sm:gap-5 [column-fill:_balance]">
            {items.map((item) => {
              const imageSrc =
                typeof item.image === "string" ? item.image.trim() : "";
              const title = pickCmsText(item.title, "Gallery", locale);
              const preferTall = Boolean(item.tall);
              const preferWide = Boolean(item.wide);

              return (
                <article
                  key={String(item.id)}
                  className="mb-4 sm:mb-5 break-inside-avoid group relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] bg-[#EDEAE4]"
                >
                  <div
                    className={`relative w-full overflow-hidden ${
                      preferWide
                        ? "aspect-[4/3]"
                        : preferTall
                          ? "aspect-[3/4]"
                          : "aspect-[4/5]"
                    }`}
                  >
                    {imageSrc ? (
                      <CmsResolvedImage
                        src={imageSrc}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
