"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const selectedSubtitle = selectedItem
    ? String((selectedItem as CmsGallery).projectDesc || "")
    : "";

  const openDetail = useCallback(
    (id: string | number) => {
      const url = new URL(window.location.href);
      url.searchParams.set("image", String(id));
      router.push(`${url.pathname}?${url.searchParams.toString()}`, {
        scroll: false,
      });
    },
    [router]
  );

  const closeDetail = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("image");
    const qs = url.searchParams.toString();
    router.push(qs ? `${url.pathname}?${qs}` : url.pathname, { scroll: false });
  }, [router]);

  const currentIndex = selectedItem
    ? items.findIndex((it) => String(it.id) === String(selectedItem.id))
    : -1;

  const goRelative = useCallback(
    (delta: number) => {
      if (currentIndex < 0 || items.length === 0) return;
      const next = items[(currentIndex + delta + items.length) % items.length];
      if (next) openDetail(next.id);
    },
    [currentIndex, items, openDetail]
  );

  /** Lock page scroll and wire Esc / arrow keys while the viewer is open. */
  useEffect(() => {
    if (!selectedItem) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetail();
      if (event.key === "ArrowRight") goRelative(1);
      if (event.key === "ArrowLeft") goRelative(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedItem, closeDetail, goRelative]);

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
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-viewer-title"
            onClick={closeDetail}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm animate-[gallery-detail-in_220ms_ease-out] motion-reduce:animate-none sm:p-6"
          >
            <div
              onClick={(event) => event.stopPropagation()}
              className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.25rem] bg-[#F7F4EF] shadow-2xl sm:rounded-[1.5rem]"
            >
              <button
                type="button"
                onClick={closeDetail}
                aria-label="Close image"
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-2xl leading-none text-white transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                &times;
              </button>

              {items.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => goRelative(-1)}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl leading-none text-white transition hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-3"
                  >
                    &#8249;
                  </button>
                  <button
                    type="button"
                    onClick={() => goRelative(1)}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl leading-none text-white transition hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-3"
                  >
                    &#8250;
                  </button>
                </>
              ) : null}

              <div className="flex min-h-0 flex-1 items-center justify-center bg-[#141414]">
                {selectedItem.image ? (
                  <CmsResolvedImage
                    src={selectedItem.image}
                    alt={selectedTitle}
                    width={1600}
                    height={1200}
                    priority
                    className="max-h-[60vh] w-auto max-w-full object-contain"
                    sizes="(max-width: 768px) 100vw, 1024px"
                  />
                ) : null}
              </div>

              <div className="shrink-0 overflow-y-auto px-5 py-5 text-center sm:px-10 sm:py-7">
                <h2
                  id="gallery-viewer-title"
                  className="text-xl font-semibold tracking-[-0.02em] text-[#1A1A1A] sm:text-2xl lg:text-3xl"
                >
                  {selectedTitle}
                </h2>
                {selectedSubtitle ? (
                  <p className="mx-auto mt-2.5 max-w-2xl text-sm leading-6 text-[#5C6370] sm:text-base sm:leading-7">
                    {selectedSubtitle}
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
                  <Link
                    href="/contact"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#1A1A1A] px-7 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A47B5B]"
                  >
                    Enquire about this project
                  </Link>
                  {items.length > 1 ? (
                    <span className="text-xs font-medium text-[#9CA3AF]">
                      {currentIndex + 1} / {items.length}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
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
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/75 via-black/25 to-transparent px-4 pb-3.5 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                        <p className="text-sm font-semibold leading-snug text-white">
                          {title}
                        </p>
                      </div>
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
