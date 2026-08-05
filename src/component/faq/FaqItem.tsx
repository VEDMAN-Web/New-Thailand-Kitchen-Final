"use client";

import { useState } from "react";
import type { FaqItem as FaqItemType } from "./faqData";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";

interface Props {
  item: FaqItemType & { question?: string; answer?: string };
}

export default function FaqItem({ item }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const question =
    item.question ||
    (typeof item.id === "number"
      ? t(`faq.q${item.id}` as TranslationKey)
      : "");
  const answer =
    item.answer ||
    (typeof item.id === "number"
      ? t(`faq.a${item.id}` as TranslationKey)
      : "");

  return (
    <div className="border-b border-[#E5DED4]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-start justify-between gap-6 py-6 text-left"
        aria-expanded={open}
      >
        <span className="text-base sm:text-lg font-semibold text-[#1A1A1A] leading-7">
          {question}
        </span>

        <span
          className={`shrink-0 w-9 h-9 rounded-full border border-[#D8CFC3] flex items-center justify-center text-[#1A1A1A] text-xl leading-none transition-transform duration-300 ${
            open ? "rotate-45 bg-[#E0905A] border-[#E0905A] text-white" : ""
          }`}
        >
          +
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-60 pb-6 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-[#6B6B6B] text-sm sm:text-[15px] leading-7 max-w-3xl pr-12">
          {answer}
        </p>
      </div>
    </div>
  );
}
