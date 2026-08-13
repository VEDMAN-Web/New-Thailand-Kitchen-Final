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

/** Friendly block title + image label that mirror the live page. */
export function sectionSlotMeta(
  layout: string,
  index: number
): { title: string; imageLabel: string; pageHint: string; usesImage: boolean } {
  const n = index + 1;
  switch (layout) {
    case "cards":
      return {
        title: `${n} · Highlights`,
        imageLabel: "Highlights image",
        pageHint: "Used on: Highlights / feature cards block",
        usesImage: true,
      };
    case "image-right":
      return {
        title: `${n} · Feature (image right)`,
        imageLabel: "Feature image",
        pageHint: "Used on: split block — image on the right",
        usesImage: true,
      };
    case "image-left":
      return {
        title: `${n} · Feature (image left)`,
        imageLabel: "Feature image",
        pageHint: "Used on: split block — image on the left",
        usesImage: true,
      };
    case "wide":
      return {
        title: `${n} · Wide banner`,
        imageLabel: "Wide banner image",
        pageHint: "Used on: full-width image + text section",
        usesImage: true,
      };
    case "split-dark":
      return {
        title: `${n} · Style story`,
        imageLabel: "Style story image",
        pageHint: "Used on: dark panel beside large image",
        usesImage: true,
      };
    case "steps":
      return {
        title: `${n} · Process steps`,
        imageLabel: "Process image",
        pageHint: "Used on: process / how it works block",
        usesImage: true,
      };
    case "checklist":
      return {
        title: `${n} · Checklist`,
        imageLabel: "Checklist banner image",
        pageHint: "Used on: checklist block (optional banner)",
        usesImage: true,
      };
    case "stats":
      return {
        title: `${n} · Stats`,
        imageLabel: "Stats banner image",
        pageHint: "Used on: stats / chips block (optional banner)",
        usesImage: true,
      };
    case "quote":
      return {
        title: `${n} · Quote`,
        imageLabel: "",
        pageHint: "Used on: quote strip (no image)",
        usesImage: false,
      };
    case "band":
      return {
        title: `${n} · Mid-page CTA`,
        imageLabel: "",
        pageHint: "Used on: mid-page call-to-action band (no image)",
        usesImage: false,
      };
    case "text":
      return {
        title: `${n} · Text`,
        imageLabel: "",
        pageHint: "Used on: text-only block",
        usesImage: false,
      };
    default:
      return {
        title: `${n} · Section`,
        imageLabel: "Section image",
        pageHint: "Used on: content section",
        usesImage: !["text", "quote", "band"].includes(layout),
      };
  }
}

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
  /** Optional: load a typed default template (kitchen landings). */
  onLoadTemplate?: () => void;
  loadTemplateLabel?: string;
};

export default function SectionBlocksEditor({
  sections,
  onChange,
  locale,
  label = "Page content sections",
  onLoadTemplate,
  loadTemplateLabel = "Load default page template",
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">
            {label}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">
            Order top → bottom on the live page. Each image field maps to one
            picture on the site.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onLoadTemplate ? (
            <button
              type="button"
              onClick={() => {
                if (
                  sections.length > 0 &&
                  !confirm(
                    "Replace current sections with the default page template for this type?"
                  )
                ) {
                  return;
                }
                onLoadTemplate();
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs font-semibold text-[#1A2332] hover:bg-[#F1F5F9]"
            >
              {loadTemplateLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#CBD5E1] px-2 py-1 text-xs font-semibold text-[#1A2332]"
          >
            <Plus className="h-3 w-3" /> Add section
          </button>
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="text-xs text-[#9CA3AF] px-2 py-4 text-center rounded-lg border border-dashed border-[#E2E5EA] bg-white">
          No sections yet — use &quot;Load default page template&quot; or add
          sections manually.
        </p>
      ) : null}

      {sections.map((block, i) => {
        const layoutMeta = SECTION_LAYOUTS.find((l) => l.value === block.layout);
        const slot = sectionSlotMeta(block.layout || "image-left", i);
        const headingPreview = localizedValue(block.heading, "en").trim();
        return (
          <div
            key={`section-${i}`}
            className="space-y-2 rounded-lg border border-[#E8EAED] bg-white p-3"
          >
            <div className="flex justify-between items-center gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-md bg-[#1A2332] px-2 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-xs font-semibold text-[#334155] truncate">
                    {slot.title}
                    {headingPreview ? (
                      <span className="font-normal text-[#6B7280]">
                        {" "}
                        — {headingPreview}
                      </span>
                    ) : null}
                  </p>
                </div>
                <p className="text-[11px] text-[#6B7280] mt-0.5 pl-9">
                  {slot.pageHint}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
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

            {slot.usesImage ? (
              <div className="space-y-1">
                <MediaUpload
                  label={slot.imageLabel}
                  value={block.image}
                  onChange={(v) => {
                    const next = [...sections];
                    next[i] = { ...block, image: v };
                    onChange(next);
                  }}
                />
                <p className="text-[11px] text-[#6B7280]">{slot.pageHint}</p>
              </div>
            ) : null}
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
