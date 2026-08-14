"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import LocaleTabs from "@/components/LocaleTabs";
import MediaUpload from "@/components/MediaUpload";
import { CMS_SYNCED_EVENT } from "@/lib/adminSectionNav";
import {
  asLocalizedForm,
  emptyLocalized,
  localizedValue,
  writeLocalized,
  type LocaleCode,
  type LocalizedText,
} from "@/lib/localized";
import {
  getVarsoviaSite,
  updateVarsoviaSite,
  varsoviaErrorMessage,
} from "@/services/varsoviaAPI";
import { IA_HUB_PATHS } from "@/app/varsovia/iaPagesDefaults";

type ContentSection = {
  heading?: LocalizedText;
  text?: LocalizedText;
  image?: string;
  imagePosition?: string;
  layout?: string;
};

type HubDraft = {
  hero: {
    eyebrow: LocalizedText;
    title: LocalizedText;
    subtitle: LocalizedText;
    image: string;
    ctaLabel: LocalizedText;
    ctaHref: string;
  };
  body: LocalizedText;
  sections: ContentSection[];
  exploreTitle: LocalizedText;
  exploreSubtitle: LocalizedText;
  indexable: boolean;
  metaTitle: LocalizedText;
  metaDescription: LocalizedText;
};

function emptyHubDraft(): HubDraft {
  return {
    hero: {
      eyebrow: emptyLocalized(),
      title: emptyLocalized(),
      subtitle: emptyLocalized(),
      image: "",
      ctaLabel: emptyLocalized(),
      ctaHref: "/contact",
    },
    body: emptyLocalized(),
    sections: [],
    exploreTitle: emptyLocalized(),
    exploreSubtitle: emptyLocalized(),
    indexable: false,
    metaTitle: emptyLocalized(),
    metaDescription: emptyLocalized(),
  };
}

function asLoc(value: unknown): LocalizedText {
  return asLocalizedForm(value) || emptyLocalized();
}

function sectionsFromApi(raw: unknown): ContentSection[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      heading: asLoc(row.heading),
      text: asLoc(row.text),
      image: String(row.image || ""),
      imagePosition: String(row.imagePosition || ""),
      layout: String(row.layout || ""),
    };
  });
}

function hubFromApi(raw: Record<string, unknown> | undefined): HubDraft {
  const src = raw || {};
  const hero =
    src.hero && typeof src.hero === "object"
      ? (src.hero as Record<string, unknown>)
      : {};
  return {
    hero: {
      eyebrow: asLoc(hero.eyebrow),
      title: asLoc(hero.title),
      subtitle: asLoc(hero.subtitle),
      image: String(hero.image || ""),
      ctaLabel: asLoc(hero.ctaLabel),
      ctaHref: String(hero.ctaHref || "/contact"),
    },
    body: asLoc(src.body),
    sections: sectionsFromApi(src.sections),
    exploreTitle: asLoc(src.exploreTitle),
    exploreSubtitle: asLoc(src.exploreSubtitle),
    indexable: src.indexable === true,
    metaTitle: asLoc(src.metaTitle),
    metaDescription: asLoc(src.metaDescription),
  };
}

function hubToApi(draft: HubDraft): Record<string, unknown> {
  return {
    hero: {
      eyebrow: asLocalizedForm(draft.hero.eyebrow),
      title: asLocalizedForm(draft.hero.title),
      subtitle: asLocalizedForm(draft.hero.subtitle),
      image: draft.hero.image.trim(),
      ctaLabel: asLocalizedForm(draft.hero.ctaLabel),
      ctaHref: draft.hero.ctaHref.trim() || "/contact",
    },
    body: asLocalizedForm(draft.body),
    sections: draft.sections.map((sec) => ({
      heading: asLocalizedForm(sec.heading),
      text: asLocalizedForm(sec.text),
      image: sec.image || "",
      imagePosition: sec.imagePosition || undefined,
      layout: sec.layout && sec.layout !== "auto" ? sec.layout : undefined,
    })),
    exploreTitle: asLocalizedForm(draft.exploreTitle),
    exploreSubtitle: asLocalizedForm(draft.exploreSubtitle),
    indexable: draft.indexable,
    metaTitle: asLocalizedForm(draft.metaTitle),
    metaDescription: asLocalizedForm(draft.metaDescription),
  };
}

function TextField({
  label,
  value,
  locale,
  onChange,
  multiline,
  maxLength,
}: {
  label: string;
  value: LocalizedText;
  locale: LocaleCode;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
  maxLength?: number;
}) {
  const cls =
    "mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm";
  const current = localizedValue(value, locale);
  return (
    <label className="block text-xs font-semibold text-[#5C6370]">
      {label} ({locale.toUpperCase()})
      {multiline ? (
        <textarea
          rows={3}
          value={current}
          maxLength={maxLength}
          onChange={(e) =>
            onChange(
              writeLocalized(
                value,
                locale,
                maxLength ? e.target.value.slice(0, maxLength) : e.target.value
              )
            )
          }
          className={cls}
        />
      ) : (
        <input
          value={current}
          maxLength={maxLength}
          onChange={(e) =>
            onChange(
              writeLocalized(
                value,
                locale,
                maxLength ? e.target.value.slice(0, maxLength) : e.target.value
              )
            )
          }
          className={cls}
        />
      )}
      {maxLength ? (
        <span className="mt-0.5 block text-[11px] font-normal text-[#9CA3AF]">
          {current.length}/{maxLength}
        </span>
      ) : null}
    </label>
  );
}

function ContentSectionsEditor({
  locale,
  sections,
  onChange,
}: {
  locale: LocaleCode;
  sections: ContentSection[];
  onChange: (next: ContentSection[]) => void;
}) {
  const update = (index: number, patch: Partial<ContentSection>) => {
    onChange(sections.map((sec, i) => (i === index ? { ...sec, ...patch } : sec)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">
          Content blocks
        </p>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...sections,
              {
                heading: emptyLocalized(),
                text: emptyLocalized(),
                image: "",
                imagePosition: sections.length % 2 === 0 ? "left" : "right",
                layout: "auto",
              },
            ])
          }
          className="rounded-lg border border-dashed border-[#B9C0CA] px-3 py-1.5 text-xs font-semibold text-[#5C6370]"
        >
          + Add block
        </button>
      </div>
      {sections.map((sec, index) => (
        <div
          key={index}
          className="space-y-3 rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#5C6370]">Block {index + 1}</span>
            <button
              type="button"
              onClick={() => onChange(sections.filter((_, i) => i !== index))}
              className="text-xs font-semibold text-[#B42318]"
            >
              Remove
            </button>
          </div>
          <TextField
            label="Heading"
            value={sec.heading || emptyLocalized()}
            locale={locale}
            onChange={(heading) => update(index, { heading })}
          />
          <TextField
            label="Text"
            value={sec.text || emptyLocalized()}
            locale={locale}
            multiline
            onChange={(text) => update(index, { text })}
          />
          <MediaUpload
            label={`Block ${index + 1} photo`}
            kind="image"
            value={sec.image || ""}
            onChange={(image) => update(index, { image })}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-[#5C6370]">
              Image side
              <select
                value={
                  sec.imagePosition === "right" || sec.imagePosition === "left"
                    ? sec.imagePosition
                    : index % 2 === 0
                      ? "left"
                      : "right"
                }
                onChange={(e) => update(index, { imagePosition: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
              >
                <option value="left">Photo left</option>
                <option value="right">Photo right</option>
              </select>
            </label>
            <label className="block text-xs font-semibold text-[#5C6370]">
              Layout
              <select
                value={
                  ["band", "spotlight", "editorial", "overlay", "rail"].includes(
                    String(sec.layout || "")
                  )
                    ? String(sec.layout)
                    : "auto"
                }
                onChange={(e) =>
                  update(index, {
                    layout: e.target.value === "auto" ? "" : e.target.value,
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
              >
                <option value="auto">Auto</option>
                <option value="band">Band</option>
                <option value="spotlight">Spotlight</option>
                <option value="editorial">Editorial</option>
                <option value="overlay">Overlay</option>
                <option value="rail">Rail</option>
              </select>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VarsoviaHubLandingEditor({
  hubKey,
  label,
  withExploreHeadings = true,
  onSaved,
}: {
  hubKey: string;
  label: string;
  withExploreHeadings?: boolean;
  onSaved?: () => void;
}) {
  const sitePath = IA_HUB_PATHS[hubKey] || `/${hubKey}`;
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [pages, setPages] = useState<Record<string, unknown>>({});
  const [draft, setDraft] = useState<HubDraft>(emptyHubDraft());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const site = await getVarsoviaSite();
      const allPages = (site.pages || {}) as Record<string, Record<string, unknown>>;
      setPages(allPages);
      setDraft(hubFromApi(allPages[hubKey]));
    } catch (err) {
      toast.error(varsoviaErrorMessage(err, "Failed to load hub page"));
    } finally {
      setLoading(false);
    }
  }, [hubKey]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => void load();
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const existing = (pages[hubKey] || {}) as Record<string, unknown>;
      const nextHub = {
        ...existing,
        ...hubToApi(draft),
        slug: existing.slug || hubKey,
      };
      const nextPages = { ...pages, [hubKey]: nextHub };
      await updateVarsoviaSite({ pages: nextPages });
      setPages(nextPages);
      toast.success(`${label} page saved`);
      onSaved?.();
    } catch (err) {
      toast.error(varsoviaErrorMessage(err, "Failed to save page"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#E8EDF2] bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1A2332]">
            {label} page hero{" "}
            <span className="font-mono text-xs font-normal text-[#6B7280]">
              {sitePath}
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Overlay hero on the live site: tag, heading, description, background
            image, and button. Clearing a section here removes it from the site.
          </p>
          <div className="mt-3">
            <LocaleTabs locale={locale} onChange={setLocale} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || saving}
            onClick={() => void load()}
            className="rounded-lg border border-[#E2E5EA] text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={saving || loading}
            onClick={() => void save()}
            className="rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
          >
            {saving ? "Saving…" : `Save ${label} page`}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[#6B7280]">Loading page fields…</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#E8EDF2] bg-[#F8FAFC] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">
              1 · Top banner (Hero)
            </p>
          </div>
          <TextField
            label="Eyebrow (small line above headline)"
            value={draft.hero.eyebrow}
            locale={locale}
            onChange={(eyebrow) =>
              setDraft((d) => ({ ...d, hero: { ...d.hero, eyebrow } }))
            }
          />
          <TextField
            label="Headline (H1)"
            value={draft.hero.title}
            locale={locale}
            onChange={(title) =>
              setDraft((d) => ({ ...d, hero: { ...d.hero, title } }))
            }
          />
          <TextField
            label="Intro line under headline"
            value={draft.hero.subtitle}
            locale={locale}
            multiline
            onChange={(subtitle) =>
              setDraft((d) => ({ ...d, hero: { ...d.hero, subtitle } }))
            }
          />
          <MediaUpload
            label="Banner photo"
            kind="image"
            value={draft.hero.image}
            onChange={(image) =>
              setDraft((d) => ({ ...d, hero: { ...d.hero, image } }))
            }
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <TextField
              label="Button text"
              value={draft.hero.ctaLabel}
              locale={locale}
              onChange={(ctaLabel) =>
                setDraft((d) => ({ ...d, hero: { ...d.hero, ctaLabel } }))
              }
            />
            <label className="block text-xs font-semibold text-[#5C6370]">
              Button link
              <input
                value={draft.hero.ctaHref}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    hero: { ...d.hero, ctaHref: e.target.value },
                  }))
                }
                placeholder="/contact"
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
              />
            </label>
          </div>

          <div className="rounded-lg border border-[#E8EDF2] bg-[#F8FAFC] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">
              2 · Intro paragraph
            </p>
          </div>
          <TextField
            label="Intro paragraph"
            value={draft.body}
            locale={locale}
            multiline
            onChange={(body) => setDraft((d) => ({ ...d, body }))}
          />

          <div className="rounded-lg border border-[#E8EDF2] bg-[#F8FAFC] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">
              3 · Content blocks (image + text)
            </p>
          </div>
          <ContentSectionsEditor
            locale={locale}
            sections={draft.sections}
            onChange={(sections) => setDraft((d) => ({ ...d, sections }))}
          />

          {withExploreHeadings ? (
            <>
              <div className="rounded-lg border border-[#E8EDF2] bg-[#F8FAFC] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">
                  4 · Explore (sub-pages list)
                </p>
                <p className="mt-1 text-[11px] text-[#6B7280]">
                  Heading above the sub-page cards. Edit cards in the grid below.
                </p>
              </div>
              <TextField
                label="Explore section title"
                value={draft.exploreTitle}
                locale={locale}
                onChange={(exploreTitle) =>
                  setDraft((d) => ({ ...d, exploreTitle }))
                }
              />
              <TextField
                label="Explore section subtitle"
                value={draft.exploreSubtitle}
                locale={locale}
                onChange={(exploreSubtitle) =>
                  setDraft((d) => ({ ...d, exploreSubtitle }))
                }
              />
            </>
          ) : null}

          <div className="rounded-lg border border-[#E8EDF2] bg-[#F8FAFC] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">
              {withExploreHeadings ? "5 · Google / SEO" : "4 · Google / SEO"}
            </p>
          </div>
          <label className="flex items-start gap-3 text-sm text-[#1A2332]">
            <input
              type="checkbox"
              checked={draft.indexable}
              onChange={(e) =>
                setDraft((d) => ({ ...d, indexable: e.target.checked }))
              }
              className="mt-0.5 w-4 h-4 rounded border-[#E2E5EA]"
            />
            <span>
              <span className="font-medium">Indexable</span>
              <span className="block text-xs text-[#6B7280]">
                OFF until final photo and copy are approved.
              </span>
            </span>
          </label>
          <TextField
            label="Google title (browser tab)"
            value={draft.metaTitle}
            locale={locale}
            maxLength={60}
            onChange={(metaTitle) => setDraft((d) => ({ ...d, metaTitle }))}
          />
          <TextField
            label="Google description"
            value={draft.metaDescription}
            locale={locale}
            multiline
            maxLength={160}
            onChange={(metaDescription) =>
              setDraft((d) => ({ ...d, metaDescription }))
            }
          />
        </div>
      )}
    </div>
  );
}
