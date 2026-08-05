"use client";

import Image from "next/image";
import {
  contactLocations,
  contactDetails,
  contactCraftImage,
} from "./contactData";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";

const contactLabelKeys: Record<string, TranslationKey> = {
  "Email Us": "contact.emailUs",
  "Call Us": "contact.callUs",
};

const locationTitleKeys: Record<number, TranslationKey> = {
  1: "contact.location.pattaya",
  2: "contact.location.samui",
};

function MapPinIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="mt-0.5 shrink-0 text-[#E0905A]"
    >
      <path
        d="M12 22s7-7.2 7-12.2A7 7 0 1 0 5 9.8C5 14.8 12 22 12 22Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-[#E0905A]"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-[#E0905A]"
    >
      <path
        d="M8.5 3.5h3.2l1.1 4.2-2 1.2a12.5 12.5 0 0 0 5.3 5.3l1.2-2 4.2 1.1v3.2c0 .9-.7 1.7-1.6 1.8A16.5 16.5 0 0 1 3.7 5.1c.1-.9.9-1.6 1.8-1.6Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ContactInfoPanel() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full pt-2 sm:pt-4 lg:pt-6">
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {contactLocations.map((location) => (
            <div key={location.id} className="flex gap-3 items-start">
              <MapPinIcon />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">
                  {t(locationTitleKeys[location.id])}
                </h3>
                <p className="mt-1 text-sm text-[#6B6B6B] leading-6 whitespace-pre-line">
                  {location.address}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {contactDetails.map((item) => (
            <div key={item.id} className="flex gap-3 items-start">
              {item.type === "email" ? <EmailIcon /> : <PhoneIcon />}
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#E0905A]">
                  {t(contactLabelKeys[item.label])}
                </p>
                <p className="text-sm font-semibold text-[#1A1A1A] mt-1">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-8 w-full">
        <div className="group relative w-full aspect-[16/9] rounded-[2rem] overflow-hidden">
          <Image
            src={contactCraftImage}
            alt="Craftsmanship detail"
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>
      </div>
    </div>
  );
}
