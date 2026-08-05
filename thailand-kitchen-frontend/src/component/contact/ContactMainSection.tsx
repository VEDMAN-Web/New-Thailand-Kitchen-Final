import ContactPageForm from "./ContactPageForm";
import ContactInfoPanel from "./ContactInfoPanel";

export default function ContactMainSection() {
  return (
    <section className="bg-[#F5F3EF] py-14 lg:py-20 px-3 sm:px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">
          <ContactPageForm />
          <ContactInfoPanel />
        </div>
      </div>
    </section>
  );
}
