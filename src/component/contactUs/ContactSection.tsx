"use client";

import Image from "next/image";
import ContactForm from "./ContactForm";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useCmsSection } from "../../lib/CmsHomeContext";
import { pickCmsAsset, pickCmsText } from "../../lib/cmsText";

type HomeContactCms = {
  eyebrow?: unknown;
  title?: unknown;
  formTitle?: unknown;
  image?: string;
};

export default function ContactSection() {
  const { t, locale } = useTranslation();
  const cms = useCmsSection<HomeContactCms>("homeContact");

  const eyebrow = pickCmsText(cms?.eyebrow, t("home.contact.eyebrow"), locale);
  const title = pickCmsText(cms?.title, t("home.contact.title"), locale);
  const formTitle = pickCmsText(
    cms?.formTitle,
    t("home.contact.formTitle"),
    locale
  );
  const image =
    pickCmsAsset(cms?.image, "") || "/contactUs/contact.png";
  const remoteImage =
    image.startsWith("http") || image.startsWith("/uploads");

  return (
    <section id="contact" className="pb-16 lg:pb-20 bg-[#F5F3EF] scroll-mt-28">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
          {eyebrow}
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] mb-10 lg:mb-14">
          {t("home.contact.title")}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          <div className="bg-white rounded-[1.75rem] p-8 sm:p-10 lg:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-8 lg:mb-10 leading-snug max-w-md">
              {formTitle}
            </h3>
            <ContactForm />
          </div>

          <div className="group relative hidden lg:block rounded-[1.75rem] overflow-hidden min-h-[560px]">
            <Image
              src={image}
              alt={title || "Contact"}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="50vw"
              unoptimized={remoteImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
