import FaqHero from "./FaqHero";
import FaqSection from "./FaqSection";
import Footer from "../Footer/footer";

export default function FaqPage() {
  return (
    <div className="w-full bg-[#F5F3EF]">
      <FaqHero />
      <FaqSection />
      <Footer />
    </div>
  );
}
