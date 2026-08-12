import FaqHero from "./FaqHero";
import FaqSection from "./FaqSection";
import type { CmsFaq } from "../../services/cmsPublic";

export default function FaqPage({ initialFaqs }: { initialFaqs?: CmsFaq[] }) {
  return (
    <div className="w-full bg-[#F5F3EF]">
      <FaqHero />
      <FaqSection initialFaqs={initialFaqs} />
    </div>
  );
}
