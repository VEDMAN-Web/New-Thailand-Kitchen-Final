import type { Metadata } from "next";
import { localizedStatic } from "../../lib/seoLocale";
import { Suspense } from "react";
import GalleryPageView from "../../component/gallery/GalleryPageView";
import { fetchMergedGallery, fetchHomeSections } from "../../services/cmsPublic";
import { galleryItems } from "../../component/gallery/galleryData";
import { SITE_ORIGIN } from "../../lib/siteUrl";
import { seoAlternates } from "../../lib/pageMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GALLERY_TITLE = "Kitchen Gallery Thailand: Modern Kitchen Inspiration";
const GALLERY_DESCRIPTION =
  "Browse the Thailand Kitchens gallery to discover modern kitchen layouts and product ideas for homes and villas. Explore styles that match your space.";
const GALLERY_URL = `${SITE_ORIGIN}/gallery`;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await localizedStatic("/gallery", GALLERY_TITLE, GALLERY_DESCRIPTION);
  return {
  title: seo.title,
  description: seo.description,
  alternates: await seoAlternates("/gallery"),
  openGraph: {
    type: "website",
    title: seo.title,
    description: seo.description,
    url: GALLERY_URL,
  },
  };
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
