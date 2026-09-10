import { Suspense } from "react";
import type { Metadata } from "next";
import GalleryPageView from "../../component/gallery/GalleryPageView";
import { fetchMergedGallery, fetchHomeSections } from "../../services/cmsPublic";
import { galleryItems } from "../../component/gallery/galleryData";
import { pickCmsText } from "../../lib/cmsText";
import { pageSeo, SITE_SEO_LOCALE } from "../../lib/pageMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GALLERY_TITLE = "Kitchen Gallery | Thailand Kitchens";
const GALLERY_DESCRIPTION =
  "A curated inspiration library of tropical, modern, and minimal kitchens designed across Thailand — filter by style, layout, palette, or material.";

export async function generateMetadata(): Promise<Metadata> {
  const home = await fetchHomeSections().catch(() => ({}));
  const cms = (home as { galleryPage?: Record<string, unknown> }).galleryPage || {};
  const title = pickCmsText(cms.metaTitle, GALLERY_TITLE, SITE_SEO_LOCALE);
  const description = pickCmsText(
    cms.metaDescription || cms.description,
    GALLERY_DESCRIPTION,
    SITE_SEO_LOCALE
  );
  return pageSeo({
    title: title.includes("Thailand Kitchens")
      ? title
      : `${title} | Thailand Kitchens`,
    description,
    path: "/gallery",
    image: typeof cms.ogImage === "string" ? cms.ogImage : undefined,
  });
}

export default async function GalleryPage() {
  const [items, sections] = await Promise.all([
    fetchMergedGallery().catch(() => galleryItems),
    fetchHomeSections().catch(() => ({})),
  ]);

  const cmsFilters = (
    (
      sections as {
        galleryPage?: { filters?: { id?: string; label?: unknown }[] };
      }
    )?.galleryPage?.filters || []
  )
    .map((f) => ({ id: String(f.id || "").trim(), label: f.label ?? f.id }))
    .filter((f) => f.id);

  const hasAll = cmsFilters.some((f) => f.id === "All");
  const initialFilters = cmsFilters.length
    ? hasAll
      ? cmsFilters
      : [{ id: "All", label: "All" }, ...cmsFilters]
    : [];

  return (
    <main className="w-full">
      <Suspense fallback={<div className="min-h-[40vh] bg-[#F5F3EF]" />}>
        <GalleryPageView initialItems={items} initialFilters={initialFilters} />
      </Suspense>
    </main>
  );
}
