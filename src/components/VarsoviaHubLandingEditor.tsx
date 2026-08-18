"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudUpload } from "lucide-react";
import { toast } from "sonner";
import LocaleTabs from "@/components/LocaleTabs";
import MediaUpload from "@/components/MediaUpload";
import { CMS_SYNCED_EVENT } from "@/lib/adminSectionNav";
import {
  asLocalizedForm,
  emptyLocalized,
  localeFieldPlaceholder,
  localizedValue,
  writeLocalized,
  type LocaleCode,
  type LocalizedText,
} from "@/lib/localized";
import {
  getVarsoviaSite,
  uploadVarsoviaMedia,
  varsoviaErrorMessage,
} from "@/services/varsoviaAPI";
import { IA_HUB_PATHS } from "@/app/varsovia/iaPagesDefaults";
import { mergeIaPagesFromLiveSite } from "@/app/varsovia/mergeIaPages";
import { persistIaHubPatch } from "@/app/varsovia/persistIaHub";

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
  servicesTitle: LocalizedText;
  servicesSubtitle: LocalizedText;
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
      ctaHref: "",
    },
    body: emptyLocalized(),
    sections: [],
    exploreTitle: emptyLocalized(),
    exploreSubtitle: emptyLocalized(),
    servicesTitle: emptyLocalized(),
    servicesSubtitle: emptyLocalized(),
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

function hubFromApi(raw: unknown): HubDraft {
  const src =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
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
    servicesTitle: asLoc(src.servicesTitle),
    servicesSubtitle: asLoc(src.servicesSubtitle),
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
      imagePosition: sec.imagePosition === "right" ? "right" : "left",
      layout: "band",
    })),
    exploreTitle: asLocalizedForm(draft.exploreTitle),
    exploreSubtitle: asLocalizedForm(draft.exploreSubtitle),
    servicesTitle: asLocalizedForm(draft.servicesTitle),
    servicesSubtitle: asLocalizedForm(draft.servicesSubtitle),
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
  const current = localizedValue(value, locale, { strict: true });
  return (
    <label className="block text-xs font-semibold text-[#5C6370]">
      {label} ({locale.toUpperCase()})
      {multiline ? (
        <textarea
          rows={3}
          value={current}
          maxLength={maxLength}
          placeholder={localeFieldPlaceholder(locale)}
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
          placeholder={localeFieldPlaceholder(locale)}
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

function FieldGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-[#E8EDF2] bg-[#F8FAFC] p-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">{title}</p>
        {hint ? (
          <p className="mt-1 text-[11px] font-normal text-[#6B7280] leading-snug">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function ContentSectionsEditor({
  locale,
  sections,
  onChange,
  label = "Content blocks",
}: {
  locale: LocaleCode;
  sections: ContentSection[];
  onChange: (next: ContentSection[]) => void;
  label?: string;
}) {
  const update = (index: number, patch: Partial<ContentSection>) => {
    onChange(sections.map((sec, i) => (i === index ? { ...sec, ...patch } : sec)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[#5C6370]">{label}</p>
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
                layout: "band",
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
          className="space-y-3 rounded-xl border border-[#E2E5EA] bg-white p-4"
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
          <MediaUpload
            label={`Block ${index + 1} photo`}
            kind="image"
            value={sec.image || ""}
            onChange={(image) => update(index, { image })}
            uploadFile={uploadVarsoviaMedia}
          />
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
          <label className="block text-xs font-semibold text-[#5C6370]">
            Photo side
            <select
              className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] bg-white px-3.5 py-2.5 text-sm"
              value={sec.imagePosition === "right" ? "right" : "left"}
              onChange={(e) =>
                update(index, {
                  imagePosition: e.target.value === "right" ? "right" : "left",
                })
              }
            >
              <option value="left">Left (same as live band layout)</option>
              <option value="right">Right</option>
            </select>
          </label>
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
  showHero = true,
  showBody = true,
  showSections = true,
  showExplore,
  showSeo = true,
  pathLabel,
  helpText,
}: {
  hubKey: string;
  label: string;
  withExploreHeadings?: boolean;
  onSaved?: () => void;
  showHero?: boolean;
  showBody?: boolean;
  showSections?: boolean;
  showExplore?: boolean;
  showSeo?: boolean;
  pathLabel?: string;
  helpText?: string;
}) {
  const sitePath = pathLabel || IA_HUB_PATHS[hubKey] || `/${hubKey}`;
  const exploreVisible = showExplore ?? withExploreHeadings;
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [draft, setDraft] = useState<HubDraft>(emptyHubDraft());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const site = await getVarsoviaSite();
      const allPages = mergeIaPagesFromLiveSite(site.pages);
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
      const nextHub = {
        ...hubToApi(draft),
        slug: (IA_HUB_PATHS[hubKey] || `/${hubKey}`).replace(/^\//, ""),
      };
      const merged = await persistIaHubPatch(hubKey, nextHub);
      setDraft(hubFromApi(merged[hubKey]));
      toast.success(`${label} page saved`);
      onSaved?.();
    } catch (err) {
      toast.error(varsoviaErrorMessage(err, "Failed to save page"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-xs font-bold uppercase tracking-[0.1em] text-[#5C6370]">
          {label}
        </span>
        <button
          type="button"
          disabled={saving || loading}
          onClick={() => void save()}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#243044] disabled:opacity-60"
        >
          <CloudUpload className="h-4 w-4" />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

    <div className="rounded-xl border border-[#E8EDF2] bg-white p-5 space-y-4">
      <div>
          <p className="font-mono text-xs text-[#6B7280]">{sitePath}</p>
          <p className="text-xs text-[#6B7280] mt-1">
            {helpText ||
              "Fields follow the live page from top to bottom. Save writes this page only."}
          </p>
          <div className="mt-3">
            <LocaleTabs locale={locale} onChange={setLocale} />
          </div>
      </div>

      {loading ? (
        <p className="text-sm text-[#6B7280]">Loading page fields…</p>
      ) : (
        <div className="space-y-4">
          {showHero ? (
            <FieldGroup
              title="1 · Banner"
              hint="Live page top: photo, optional tag, heading, description, button."
            >
          <MediaUpload
            label="Banner photo"
            kind="image"
            value={draft.hero.image}
            onChange={(image) =>
              setDraft((d) => ({ ...d, hero: { ...d.hero, image } }))
            }
            uploadFile={uploadVarsoviaMedia}
          />
          <TextField
            label="Tag (optional, small uppercase)"
            value={draft.hero.eyebrow}
            locale={locale}
            onChange={(eyebrow) =>
              setDraft((d) => ({ ...d, hero: { ...d.hero, eyebrow } }))
            }
          />
          <TextField
            label="Heading"
            value={draft.hero.title}
            locale={locale}
            onChange={(title) =>
              setDraft((d) => ({ ...d, hero: { ...d.hero, title } }))
            }
          />
          <TextField
            label="Description"
            value={draft.hero.subtitle}
            locale={locale}
            multiline
            onChange={(subtitle) =>
              setDraft((d) => ({ ...d, hero: { ...d.hero, subtitle } }))
            }
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <TextField
              label="Button label"
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
            </FieldGroup>
          ) : null}

          {showBody ? (
          <FieldGroup title="2 · Intro" hint="Centered paragraph under the banner.">
          <TextField
            label="Intro paragraph"
            value={draft.body}
            locale={locale}
            multiline
            onChange={(body) => setDraft((d) => ({ ...d, body }))}
          />
          </FieldGroup>
          ) : null}

          {showSections ? (
          <FieldGroup
            title="3 · Content blocks"
            hint="Same photo + heading + text cards as the live page."
          >
          <ContentSectionsEditor
            locale={locale}
            label="Blocks"
            sections={draft.sections}
            onChange={(sections) => setDraft((d) => ({ ...d, sections }))}
          />
          </FieldGroup>
          ) : null}

          {exploreVisible ? (
            <FieldGroup
              title="4 · Explore"
              hint={
                hubKey === "interiorDesign"
                  ? "Heading above the project catalogue on /interior-design."
                  : hubKey === "locations"
                    ? "Heading above the city cards on /locations (photo + name + tagline)."
                    : "Heading above the sub-page cards."
              }
            >
              <TextField
                label="Explore title"
                value={draft.exploreTitle}
                locale={locale}
                onChange={(exploreTitle) =>
                  setDraft((d) => ({ ...d, exploreTitle }))
                }
              />
              <TextField
                label="Explore subtitle"
                value={draft.exploreSubtitle}
                locale={locale}
                onChange={(exploreSubtitle) =>
                  setDraft((d) => ({ ...d, exploreSubtitle }))
                }
              />
            </FieldGroup>
          ) : null}

          {hubKey === "locations" ? (
            <FieldGroup
              title="5 · City-page services default"
              hint="Fallback heading on /locations/[city] when that city does not set its own services heading."
            >
              <TextField
                label="Services heading (default)"
                value={draft.servicesTitle}
                locale={locale}
                onChange={(servicesTitle) =>
                  setDraft((d) => ({ ...d, servicesTitle }))
                }
              />
              <TextField
                label="Services subtitle (default)"
                value={draft.servicesSubtitle}
                locale={locale}
                onChange={(servicesSubtitle) =>
                  setDraft((d) => ({ ...d, servicesSubtitle }))
                }
              />
              <p className="text-[11px] text-[#6B7280] -mt-1">
                Each city modal can override this. Cards themselves come from
                Services tagged with that city slug.
              </p>
            </FieldGroup>
          ) : null}

          {showSeo ? (
            <FieldGroup
              title={hubKey === "locations" ? "6 · Google" : "5 · Google"}
              hint="Not shown on the page body — browser tab, share preview (banner photo), and sitemap only."
            >
          <label className="flex items-start gap-3 text-sm text-[#1A2332] pt-1">
            <input
              type="checkbox"
              checked={draft.indexable}
              onChange={(e) =>
                setDraft((d) => ({ ...d, indexable: e.target.checked }))
              }
              className="mt-0.5 w-4 h-4 rounded border-[#E2E5EA]"
            />
            <span>
              <span className="font-medium">
                Show in Google sitemap (Indexable)
              </span>
              <span className="block text-xs text-[#6B7280]">
                OFF = this page is noindex and omitted from the sitemap. ON =
                listed for Google.
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
            </FieldGroup>
          ) : null}
        </div>
      )}
    </div>
    </div>
  );
}
