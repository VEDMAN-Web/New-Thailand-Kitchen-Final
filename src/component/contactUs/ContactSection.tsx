"use client";

import Image from "next/image";
import ContactForm from "./ContactForm";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function ContactSection() {
  const { t } = useTranslation();

  return (
    <section id="contact" className="pb-16 lg:pb-20 bg-[#F5F3EF] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
          {t("home.contact.eyebrow")}
        </p>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-semibold text-[#1A1A1A] mb-10 lg:mb-14">
          {t("home.contact.title")}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          <div className="bg-white rounded-[1.75rem] p-8 sm:p-10 lg:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-8 lg:mb-10 leading-snug max-w-md">
              {t("home.contact.formTitle")}
            </h3>
            <ContactForm />
          </div>

          <div className="group relative hidden lg:block rounded-[1.75rem] overflow-hidden min-h-[560px]">
            <Image
              src="/contactUs/contact.png"
              alt="Luxury kitchen corner"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
