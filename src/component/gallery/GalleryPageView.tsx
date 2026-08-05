import GalleryHero from "./GalleryHero";
import GalleryContent from "./GalleryContent";
import Footer from "../Footer/footer";

export default function GalleryPageView() {
  return (
    <div className="w-full bg-[#F5F3EF]">
      <GalleryHero />
      <GalleryContent />
      <Footer />
    </div>
  );
}
