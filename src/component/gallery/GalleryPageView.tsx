import GalleryHero from "./GalleryHero";
import GalleryContent from "./GalleryContent";
import Footer from "../Footer/footer";
import type { CmsGallery } from "../../services/cmsPublic";

type Props = {
  initialItems?: CmsGallery[];
  initialFilters?: { id: string; label: unknown }[];
};

export default function GalleryPageView({ initialItems, initialFilters }: Props) {
  return (
    <div className="w-full bg-[#F5F3EF]">
      <GalleryHero />
      <GalleryContent initialItems={initialItems} initialFilters={initialFilters} />
      <Footer />
    </div>
  );
}
