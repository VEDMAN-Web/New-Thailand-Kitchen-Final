import ContactHero from "./ContactHero";
import ContactMainSection from "./ContactMainSection";
import Footer from "../Footer/footer";

export default function ContactPage() {
  return (
    <div className="w-full bg-[#F5F3EF]">
      <ContactHero />
      <ContactMainSection />
      <Footer />
    </div>
  );
}
