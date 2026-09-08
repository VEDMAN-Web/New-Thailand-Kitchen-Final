import type { Metadata } from "next";
import { Suspense } from "react";
import GalleryPageView from "../../component/gallery/GalleryPageView";
import { fetchMergedGallery, fetchHomeSections } from "../../services/cmsPublic";
import { galleryItems } from "../../component/gallery/galleryData";
import { SITE_ORIGIN } from "../../lib/siteUrl";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GALLERY_TITLE =
  "Kitchens of the Island — Gallery | Thailand Kitchens";
const GALLERY_DESCRIPTION =
  "A curated inspiration library of tropical, modern and minimal kitchens crafted by our Samui atelier — filter by style, layout, palette or material and discover your next design.";
const GALLERY_URL = `${SITE_ORIGIN}/gallery`;

export const metadata: Metadata = {
  title: GALLERY_TITLE,
  description: GALLERY_DESCRIPTION,
  alternates: {
    canonical: GALLERY_URL,
  },
  openGraph: {
    type: "website",
    title: GALLERY_TITLE,
    description: GALLERY_DESCRIPTION,
    url: GALLERY_URL,
  },
};

export default async function GalleryPage() {
  const [items, sections] = await Promise.all([
    fetchMergedGallery().catch(() => galleryItems),
    fetchHomeSections().catch(() => ({})),
  ]);

  const cmsFilters = (((sections as Record<string, any>)?.galleryPage?.filters || []) as {
    id?: string;
    label?: unknown;
  }[])
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
