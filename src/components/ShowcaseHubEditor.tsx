"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudUpload } from "lucide-react";
import { toast } from "sonner";
import LocaleTabs from "@/components/LocaleTabs";
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
  updateVarsoviaSite,
  varsoviaErrorMessage,
} from "@/services/varsoviaAPI";

const SHOWCASE_TABS = [
  "All",
  "Home case",
  "North America",
  "South America",
  "Africa",
  "Commercial Project",
  "Europe",
  "Australia",
  "Middle East",
  "Asia",
] as const;

type ShowcaseTab = (typeof SHOWCASE_TABS)[number];

const SUB_TABS = SHOWCASE_TABS.filter((tab) => tab !== "All") as Exclude<ShowcaseTab, "All">[];

const SEED: Record<ShowcaseTab, { title: string; subtitle: string }> = {
  All: { title: "Our Showcase", subtitle: "Every space, every story" },
  "Home case": { title: "Home case", subtitle: "Spaces Designed to Inspire" },
  "North America": { title: "North America", subtitle: "Bold Design, Modern Living" },
  "South America": { title: "South America", subtitle: "Vibrant Spaces, Warm Character" },
  Africa: { title: "Africa", subtitle: "Rooted in Culture, Rich in Design" },
  "Commercial Project": { title: "Commercial Project", subtitle: "Where Function Meets Vision" },
  Europe: { title: "Europe", subtitle: "Timeless Elegance, Refined Living" },
  Australia: { title: "Australia", subtitle: "Light-Filled Spaces, Effortless Style" },
  "Middle East": { title: "Middle East", subtitle: "Luxury Rooted in Tradition" },
  Asia: { title: "Asia", subtitle: "Harmony of Space and Serenity" },
};

type TabDraft = { title: LocalizedText; subtitle: LocalizedText };

type HubDraft = {
  tabs: Record<ShowcaseTab, TabDraft>;
  navSectionLabel: LocalizedText;
  indexable: boolean;
  metaTitle: LocalizedText;
  metaDescription: LocalizedText;
};

function emptyTabs(): Record<ShowcaseTab, TabDraft> {
  return Object.fromEntries(
    SHOWCASE_TABS.map((tab) => [
      tab,
      { title: emptyLocalized(), subtitle: emptyLocalized() },
    ])
  ) as Record<ShowcaseTab, TabDraft>;
}

function asLoc(value: unknown): LocalizedText {
  return asLocalizedForm(value) || emptyLocalized();
}

function withEnFallback(value: unknown, fallbackEn: string): LocalizedText {
  const loc = asLoc(value);
  if (localizedValue(loc, "en")) return loc;
  return writeLocalized(loc, "en", fallbackEn);
}

function draftFromSite(site: Record<string, unknown>): HubDraft {
  const meta = Array.isArray(site.showcaseMeta)
    ? (site.showcaseMeta as Record<string, unknown>[])
    : [];
  const byKey = new Map(meta.map((row) => [String(row.tabKey || ""), row]));
  const tabs = emptyTabs();
  for (const tab of SHOWCASE_TABS) {
    const row = byKey.get(tab);
    tabs[tab] = {
      title: withEnFallback(row?.title, SEED[tab].title),
      subtitle: withEnFallback(row?.subtitle, SEED[tab].subtitle),
    };
  }
  const pp =
    site.projectsPage && typeof site.projectsPage === "object"
      ? (site.projectsPage as Record<string, unknown>)
      : {};
  if (localizedValue(asLoc(pp.heroTitle), "en") && !localizedValue(tabs.All.title, "en")) {
    tabs.All.title = asLoc(pp.heroTitle);
  }
  if (localizedValue(asLoc(pp.heroSubtitle), "en") && !localizedValue(tabs.All.subtitle, "en")) {
    tabs.All.subtitle = asLoc(pp.heroSubtitle);
  }
  return {
    tabs,
    navSectionLabel: withEnFallback(pp.navSectionLabel, "By Region & Type"),
    indexable: pp.indexable === true,
    metaTitle: withEnFallback(pp.metaTitle, "Our Showcase | Varsovia Design"),
    metaDescription: withEnFallback(
      pp.metaDescription,
      "Varsovia Design showcase — homes and projects by region and type."
    ),
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
  const cls = "mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm";
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
          <p className="mt-1 text-[11px] font-normal leading-snug text-[#6B7280]">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function ShowcaseHubEditor() {
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [draft, setDraft] = useState<HubDraft>(() => draftFromSite({}));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const site = await getVarsoviaSite();
      setDraft(draftFromSite(site as Record<string, unknown>));
    } catch (err) {
      toast.error(varsoviaErrorMessage(err, "Failed to load Showcase"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => void load();
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const setTab = (tab: ShowcaseTab, patch: Partial<TabDraft>) => {
    setDraft((d) => ({
      ...d,
      tabs: { ...d.tabs, [tab]: { ...d.tabs[tab], ...patch } },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const site = (await getVarsoviaSite()) as Record<string, unknown>;
      const existingPp =
        site.projectsPage && typeof site.projectsPage === "object"
          ? (site.projectsPage as Record<string, unknown>)
          : {};
      const showcaseMeta = SHOWCASE_TABS.map((tab, order) => ({
        tabKey: tab,
        title: asLocalizedForm(draft.tabs[tab].title),
        subtitle: asLocalizedForm(draft.tabs[tab].subtitle),
        order,
      }));
      await updateVarsoviaSite({
        showcaseMeta,
        projectsPage: {
          ...existingPp,
          heroTitle: asLocalizedForm(draft.tabs.All.title),
          heroSubtitle: asLocalizedForm(draft.tabs.All.subtitle),
          navSectionLabel: asLocalizedForm(draft.navSectionLabel),
          indexable: draft.indexable,
          metaTitle: asLocalizedForm(draft.metaTitle),
          metaDescription: asLocalizedForm(draft.metaDescription),
        },
      });
      
      // MIRROR THAILAND KITCHEN PATTERN: Trust what we sent, don't re-fetch
      // draft already has the correct data that the user edited
      // No need to: await load();
      
      toast.success("Showcase page saved");
    } catch (err) {
      toast.error(varsoviaErrorMessage(err, "Failed to save Showcase"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-xs font-bold uppercase tracking-[0.1em] text-[#5C6370]">
          Showcase
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

      <div className="space-y-4 rounded-xl border border-[#E8EDF2] bg-white p-5">
        <div>
          <p className="font-mono text-xs text-[#6B7280]">/projects</p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Matches live Showcase: listing hero, mega-menu EXPLORE + By region & type, then
            project cards below. Google is tab + sitemap only.
          </p>
          <div className="mt-3">
            <LocaleTabs locale={locale} onChange={setLocale} />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-[#6B7280]">Loading page fields…</p>
        ) : (
          <div className="space-y-4">
            <FieldGroup
              title="1 · Listing + nav EXPLORE"
              hint="Live /projects (All) headline and the mega-menu “Our Showcase” row. Same two fields."
            >
              <TextField
                label="Heading"
                value={draft.tabs.All.title}
                locale={locale}
                onChange={(title) => setTab("All", { title })}
              />
              <TextField
                label="Subtitle"
                value={draft.tabs.All.subtitle}
                locale={locale}
                multiline
                onChange={(subtitle) => setTab("All", { subtitle })}
              />
              <TextField
                label="Mega-menu section label"
                value={draft.navSectionLabel}
                locale={locale}
                onChange={(navSectionLabel) =>
                  setDraft((d) => ({ ...d, navSectionLabel }))
                }
              />
            </FieldGroup>

            <FieldGroup
              title="2 · Sub-pages (By region & type)"
              hint="Each row is a filter tab on /projects and a mega-menu link. Title + tagline only — same copy in both places."
            >
              {SUB_TABS.map((tab) => (
                <div
                  key={tab}
                  className="space-y-3 rounded-xl border border-[#E2E5EA] bg-white p-4"
                >
                  <p className="text-xs font-bold text-[#5C6370]">{tab}</p>
                  <p className="font-mono text-[11px] text-[#9CA3AF]">
                    /projects?tab={encodeURIComponent(tab)}
                  </p>
                  <TextField
                    label="Heading"
                    value={draft.tabs[tab].title}
                    locale={locale}
                    onChange={(title) => setTab(tab, { title })}
                  />
                  <TextField
                    label="Tagline"
                    value={draft.tabs[tab].subtitle}
                    locale={locale}
                    multiline
                    onChange={(subtitle) => setTab(tab, { subtitle })}
                  />
                </div>
              ))}
            </FieldGroup>

            <FieldGroup
              title="3 · Google"
              hint="Not shown on the page body — browser tab and sitemap only."
            >
              <label className="flex items-start gap-3 pt-1 text-sm text-[#1A2332]">
                <input
                  type="checkbox"
                  checked={draft.indexable}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, indexable: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-[#E2E5EA]"
                />
                <span>
                  <span className="font-medium">Show in Google sitemap (Indexable)</span>
                  <span className="block text-xs text-[#6B7280]">
                    OFF = /projects is noindex and omitted from the sitemap. ON = listed
                    for Google.
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
          </div>
        )}
      </div>
    </div>
  );
}
