"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import MediaUpload from "@/components/MediaUpload";
import {
  asLocalizedForm,
  emptyLocalized,
  localizedValue,
  writeLocalized,
  type LocaleCode,
  type LocalizedText,
} from "@/lib/localized";

export type SectionBlockForm = {
  heading: LocalizedText;
  body: LocalizedText;
  image: string;
  layout: string;
};

export const SECTION_LAYOUTS: { value: string; label: string; hint: string }[] = [
  {
    value: "image-left",
    label: "Image left",
    hint: "Standard split — image left, text right.",
  },
  {
    value: "image-right",
    label: "Image right",
    hint: "Standard split — image right, text left.",
  },
  {
    value: "wide",
    label: "Wide image + text",
    hint: "Full-width image banner with text below.",
  },
  {
    value: "split-dark",
    label: "Split dark panel",
    hint: "Dark text panel beside a large image.",
  },
  {
    value: "cards",
    label: "Feature cards",
    hint: "Body: one item per line, or separate with | (e.g. Layout|Style|Property).",
  },
  {
    value: "steps",
    label: "Process steps",
    hint: "Body: one step per line. Use Title: description or Title|description.",
  },
  {
    value: "checklist",
    label: "Checklist",
    hint: "Body: one checklist item per line, or separate with |.",
  },
  {
    value: "stats",
    label: "Stats / chips",
    hint: "Body: location or stat labels separated by | or new lines.",
  },
  {
    value: "quote",
    hint: "Heading = quote text. Body = attribution line.",
    label: "Quote",
  },
  {
    value: "band",
    label: "CTA band",
    hint: "Dark call-to-action strip — heading + short body.",
  },
  {
    value: "text",
    label: "Text only",
    hint: "Heading and body only, no image.",
  },
];

function bodyPlaceholder(layout: string) {
  const found = SECTION_LAYOUTS.find((l) => l.value === layout);
  return found?.hint || "Section body copy";
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

type Props = {
  sections: SectionBlockForm[];
  onChange: (sections: SectionBlockForm[]) => void;
  locale: LocaleCode;
  label?: string;
};

export default function SectionBlocksEditor({
  sections,
  onChange,
  locale,
  label = "Page content sections",
}: Props) {
  const addSection = () => {
    onChange([
      ...sections,
      {
        heading: emptyLocalized(),
        body: emptyLocalized(),
        image: "",
        layout: "image-left",
      },
    ]);
  };

  return (
    <div className="space-y-3 rounded-lg border border-[#E8EDF2] bg-[#F8FAFC] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">
            {label}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">
            Order top → bottom on the live page. Use ↑ ↓ to reorder.
          </p>
        </div>
        <button
          type="button"
          onClick={addSection}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#CBD5E1] px-2 py-1 text-xs font-semibold text-[#1A2332] shrink-0"
        >
          <Plus className="h-3 w-3" /> Add section
        </button>
      </div>

      {sections.length === 0 ? (
        <p className="text-xs text-[#9CA3AF] px-2 py-4 text-center rounded-lg border border-dashed border-[#E2E5EA] bg-white">
          No sections yet — add at least 2 for a full landing page.
        </p>
      ) : null}

      {sections.map((block, i) => {
        const layoutMeta = SECTION_LAYOUTS.find((l) => l.value === block.layout);
        return (
          <div
            key={`section-${i}`}
            className="space-y-2 rounded-lg border border-[#E8EAED] bg-white p-3"
          >
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-md bg-[#1A2332] px-2 text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-xs font-semibold text-[#334155]">
                  Section {i + 1} of {sections.length}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => onChange(moveItem(sections, i, i - 1))}
                  className="p-1.5 rounded-md border border-[#E2E5EA] disabled:opacity-30 hover:bg-[#F4F5F7]"
                  title="Move up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={i === sections.length - 1}
                  onClick={() => onChange(moveItem(sections, i, i + 1))}
                  className="p-1.5 rounded-md border border-[#E2E5EA] disabled:opacity-30 hover:bg-[#F4F5F7]"
                  title="Move down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(sections.filter((_, idx) => idx !== i))
                  }
                  className="p-1.5 rounded-md border border-red-100 text-red-600 hover:bg-red-50"
                  title="Remove section"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <label className="block text-xs font-semibold text-[#5C6370]">
              Layout
              <select
                className="mt-1 w-full rounded-lg border border-[#E2E5EA] bg-white px-3 py-2 text-sm"
                value={block.layout || "image-left"}
                onChange={(e) => {
                  const next = [...sections];
                  next[i] = { ...block, layout: e.target.value };
                  onChange(next);
                }}
              >
                {SECTION_LAYOUTS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            {layoutMeta ? (
              <p className="text-[11px] text-[#6B7280] -mt-1">{layoutMeta.hint}</p>
            ) : null}

            <div>
              <label className="block text-xs font-semibold text-[#5C6370] mb-1">
                Heading ({locale.toUpperCase()})
              </label>
              <input
                value={localizedValue(block.heading, locale)}
                onChange={(e) => {
                  const next = [...sections];
                  next[i] = {
                    ...block,
                    heading: writeLocalized(block.heading, locale, e.target.value),
                  };
                  onChange(next);
                }}
                className="w-full rounded-lg border border-[#E2E5EA] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C6370] mb-1">
                Body ({locale.toUpperCase()})
              </label>
              <textarea
                rows={4}
                placeholder={bodyPlaceholder(block.layout)}
                value={localizedValue(block.body, locale)}
                onChange={(e) => {
                  const next = [...sections];
                  next[i] = {
                    ...block,
                    body: writeLocalized(block.body, locale, e.target.value),
                  };
                  onChange(next);
                }}
                className="w-full rounded-lg border border-[#E2E5EA] px-3 py-2 text-sm resize-y"
              />
            </div>

            {["text", "quote", "band"].includes(block.layout) ? null : (
              <MediaUpload
                label={
                  ["cards", "stats", "checklist"].includes(block.layout)
                    ? "Optional banner image"
                    : "Section image"
                }
                value={block.image}
                onChange={(v) => {
                  const next = [...sections];
                  next[i] = { ...block, image: v };
                  onChange(next);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function sectionsFromApi(raw: unknown): SectionBlockForm[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((block: any) => ({
    heading: asLocalizedForm(block?.heading),
    body: asLocalizedForm(block?.body),
    image: String(block?.image || ""),
    layout: String(block?.layout || "image-left"),
  }));
}

export function sectionsToApiPayload(sections: SectionBlockForm[]) {
  return sections.map((block) => ({
    heading: block.heading,
    body: block.body,
    image: block.image,
    layout: block.layout || "image-left",
  }));
}
