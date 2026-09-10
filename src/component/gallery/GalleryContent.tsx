"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
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

  const selectedId = searchParams.get("image");
  const selectedItem = selectedId
    ? itemsAll.find((item) => String(item.id) === selectedId)
    : undefined;
  const selectedTitle = selectedItem
    ? pickCmsText(selectedItem.title, "Gallery", locale)
    : "";

  useEffect(() => {
    if (!selectedItem) return;
    document.getElementById("gallery-detail")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedItem]);

  const openDetail = (id: string | number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("image", String(id));
    router.push(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
  };

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
                  url.searchParams.delete("image");
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

        {selectedItem ? (
          <section
            id="gallery-detail"
            aria-labelledby="gallery-detail-title"
            className="mb-14 scroll-mt-28 animate-[gallery-detail-in_450ms_ease-out] motion-reduce:animate-none"
          >
            <div className="mx-auto max-w-5xl rounded-[1.5rem] bg-white/55 px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A47B5B]">
                  Gallery detail
                </p>
                <Link
                  href={active === "All" ? "/gallery" : `/gallery?tab=${categoryToSlug(active)}`}
                  className="text-sm font-medium text-[#6B6B6B] underline-offset-4 transition-colors hover:text-[#1A1A1A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A47B5B]"
                >
                  Back to gallery
                </Link>
              </div>
              <h2
                id="gallery-detail-title"
                className="mt-4 text-center text-2xl font-semibold tracking-[-0.02em] text-[#1A1A1A] sm:text-3xl lg:text-4xl"
              >
                {selectedTitle}
              </h2>
              <div className="relative mx-auto mt-7 max-w-4xl overflow-hidden rounded-[1.25rem] bg-[#EDEAE4] sm:mt-9 sm:rounded-[1.5rem]">
                {selectedItem.image ? (
                  <CmsResolvedImage
                    src={selectedItem.image}
                    alt={selectedTitle}
                    width={1600}
                    height={1200}
                    priority
                    className="h-auto w-full object-contain"
                    sizes="(max-width: 768px) 100vw, 896px"
                  />
                ) : null}
              </div>
              <div className="mt-7 flex justify-center sm:mt-9">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1A1A1A] px-8 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_10px_24px_rgba(26,26,26,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A47B5B] active:translate-y-0"
                >
                  Explore
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {items.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#6B7280]">
            No gallery images in this filter yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {items.map((item) => {
              const imageSrc =
                typeof item.image === "string" ? item.image.trim() : "";
              const title = pickCmsText(item.title, "Gallery", locale);
              const preferTall = Boolean(item.tall);
              const preferWide = Boolean(item.wide);

              return (
                <article
                  key={String(item.id)}
                  className="group relative overflow-hidden rounded-[1.25rem] bg-[#EDEAE4] sm:rounded-[1.5rem]"
                >
                  <button
                    type="button"
                    onClick={() => openDetail(item.id)}
                    aria-label={`View ${title}`}
                    className="block w-full p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A47B5B]"
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
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
