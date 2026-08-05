"use client";

import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import Footer from "../../component/Footer/footer";
import { useTranslation } from "../../i18n/LanguageProvider";

/** Free catalogue page — PDF download without contact form */
export default function CataloguePage() {
  const { t } = useTranslation();

  return (
    <div className="w-full min-h-screen bg-[#F5F3EF]">
      <section className="pt-[80px] sm:pt-[84px] pb-16 lg:pb-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
            {t("catalogue.eyebrow")}
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A]">
            {t("catalogue.title")}
          </h1>
          <p className="mt-5 text-[#6B6B6B] text-sm sm:text-base leading-7 max-w-xl mx-auto">
            {t("catalogue.description")}
          </p>

          <div className="mt-10 mx-auto max-w-md rounded-[1.75rem] overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
            <div className="relative w-full aspect-[4/5]">
              <Image
                src="/catlog/catlog.png"
                alt="Catalogue cover"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
                priority
              />
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-[11px] tracking-[0.18em] uppercase text-[#E0905A] font-semibold mb-1">
                {t("catalogue.edition")}
              </p>
              <h2 className="text-lg font-bold uppercase tracking-wide text-[#1A1A1A]">
                {t("catalogue.fileTitle")}
              </h2>
              <a
                href="/catlog/catalogue.pdf"
                download="Thailand-Kitchens-Catalogue.pdf"
                className="mt-6 inline-flex items-center justify-center gap-2 w-full bg-[#1A1A1A] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-black transition"
              >
                <Download size={18} />
                {t("catalogue.download")}
              </a>
              <p className="mt-3 text-xs text-[#9A9A9A]">
                {t("catalogue.note")}
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="mt-10 inline-flex text-sm font-medium text-[#1A1A1A] hover:text-[#E0905A] transition"
          >
            {t("catalogue.contactLink")} →
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
