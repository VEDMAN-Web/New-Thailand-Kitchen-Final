"use client";

import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";

const categoryKeyMap: Record<string, TranslationKey> = {
  All: "gallery.filter.all",
  "Layout & Space": "gallery.filter.layout",
  Storage: "gallery.filter.storage",
  "Style & Color": "gallery.filter.style",
  Materials: "gallery.filter.materials",
};

interface Props {
  active: string;
  categories: string[];
  onChange: (category: string) => void;
}

export default function BlogFilters({ active, categories, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap justify-start gap-3">
      {categories.map((category) => {
        const isActive = category === active;
        const labelKey = categoryKeyMap[category];
        const label = labelKey ? t(labelKey) : category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? "bg-[#1A1A1A] text-white"
                : "bg-[#EDE8E1] text-[#1A1A1A] hover:bg-[#E5DFD6]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
