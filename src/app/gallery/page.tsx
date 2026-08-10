import { Suspense } from "react";
import GalleryPageView from "../../component/gallery/GalleryPageView";
import { fetchMergedGallery, fetchHomeSections } from "../../services/cmsPublic";
import { galleryItems } from "../../component/gallery/galleryData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  return (
    <main className="w-full">
      <Suspense fallback={<div className="min-h-[40vh] bg-[#F5F3EF]" />}>
        <GalleryPageView initialItems={items} initialFilters={cmsFilters} />
      </Suspense>
    </main>
  );
}
