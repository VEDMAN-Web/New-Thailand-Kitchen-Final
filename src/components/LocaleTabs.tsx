"use client";

import clsx from "clsx";
import { CMS_LOCALES, type LocaleCode } from "@/lib/localized";

export default function LocaleTabs({
  locale,
  onChange,
  className,
}: {
  locale: LocaleCode;
  onChange: (locale: LocaleCode) => void;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1 rounded-lg border border-[#E2E5EA] bg-[#F8FAFC] p-1",
        className
      )}
      role="tablist"
      aria-label="Content language"
    >
      {CMS_LOCALES.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={locale === item.id}
          onClick={() => onChange(item.id)}
          className={clsx(
            "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
            locale === item.id
              ? "bg-[#1A2332] text-white"
              : "text-[#5C6370] hover:bg-white"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
