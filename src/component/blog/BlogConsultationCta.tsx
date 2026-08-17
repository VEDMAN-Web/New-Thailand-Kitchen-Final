"use client";

import { useState } from "react";
import { useTranslation } from "../../i18n/LanguageProvider";
import ConsultationEnquiryModal from "../ConsultationEnquiryModal";

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className="shrink-0 mt-0.5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.3 2.3L16 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * "Request Your Free Kitchen Consultation" CTA block, shown at the end of
 * every blog/guides post. Opens the shared ConsultationEnquiryModal so leads
 * are stored the same way as every other enquiry on the site (Mongo +
 * GoHighLevel push, tagged by site on the backend).
 */
export default function BlogConsultationCta() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const points = [t("blog.cta.point1"), t("blog.cta.point2"), t("blog.cta.point3")];

  return (
    <div className="mt-16 lg:mt-20 max-w-4xl mx-auto">
      <div className="rounded-[1.5rem] border border-[#E0905A]/30 bg-white px-6 py-8 sm:px-10 sm:py-10">
        <h2 className="text-2xl sm:text-[1.75rem] font-extrabold text-[#1A1A1A]">
          {t("blog.cta.title")}
        </h2>
        <p className="mt-3 text-[#6B6B6B] text-[15px] sm:text-base leading-7 max-w-2xl">
          {t("blog.cta.description")}
        </p>

        <ul className="mt-6 space-y-3">
          {points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 text-[#4A4A4A] text-[15px] leading-6"
            >
              <span className="text-[#E0905A]">
                <CheckIcon />
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-7 inline-flex items-center justify-center rounded-lg bg-[#1A2332] hover:bg-[#0F1520] text-white text-sm font-semibold px-6 py-3 transition"
        >
          {t("blog.cta.button")}
        </button>
      </div>

      <ConsultationEnquiryModal
        open={open}
        onClose={() => setOpen(false)}
        leadSource="blog_cta"
      />
    </div>
  );
}
