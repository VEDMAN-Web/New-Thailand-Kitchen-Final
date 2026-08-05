import { Suspense } from "react";
import GalleryPageView from "../../component/gallery/GalleryPageView";

export default function GalleryPage() {
  return (
    <main className="w-full">
      <Suspense fallback={<div className="min-h-[40vh] bg-[#F5F3EF]" />}>
        <GalleryPageView />
      </Suspense>
    </main>
  );
}
