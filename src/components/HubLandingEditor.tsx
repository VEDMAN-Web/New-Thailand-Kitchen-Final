"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import LocaleTabs from "@/components/LocaleTabs";
import MediaUpload from "@/components/MediaUpload";
import SectionBlocksEditor, {
  sectionsFromApi,
  sectionsToApiPayload,
} from "@/components/SectionBlocksEditor";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { CMS_SYNCED_EVENT } from "@/lib/adminSectionNav";
import {
  asLocalizedForm,
  emptyLocalized,
  localizedValue,
  writeLocalized,
  type LocaleCode,
  type LocalizedText,
} from "@/lib/localized";
import type { AdminHubMeta } from "@/lib/thailandHubs";
import { getHome, updateHome } from "@/services/adminAPI";

const KITCHEN_SUBS: {
  key: string;
  tag: string;
  label: string;
  path: string;
}[] = [
  { key: "layouts", tag: "Layout", label: "Kitchen Layouts", path: "/kitchens/layouts" },
  { key: "styles", tag: "Style", label: "Kitchen Styles", path: "/kitchens/styles" },
  { key: "byProperty", tag: "Property", label: "Kitchens by Property", path: "/kitchens/by-property" },
];

type HubDraft = {
  title: LocalizedText;
  description: LocalizedText;
  eyebrow: LocalizedText;
  heroImage: string;
  ctaLabel: LocalizedText;
  ctaHref: string;
  sections: unknown;
  subsections?: Record<string, HubDraft>;
};

function emptyHub(): HubDraft {
  return {
    title: emptyLocalized(),
    description: emptyLocalized(),
    eyebrow: emptyLocalized(),
    heroImage: "",
    ctaLabel: emptyLocalized(),
    ctaHref: "/contact",
    sections: [],
    subsections: {},
  };
}

function fromApi(raw: Record<string, unknown> | undefined, withSubs = false): HubDraft {
  const src = raw || {};
  const subsections: Record<string, HubDraft> = {};
  if (withSubs) {
    const subs = (src.subsections || {}) as Record<string, Record<string, unknown>>;
    for (const row of KITCHEN_SUBS) {
      subsections[row.key] = fromApi(subs[row.key], false);
    }
  }
  return {
    title: asLocalizedForm(src.title),
    description: asLocalizedForm(src.description),
    eyebrow: asLocalizedForm(src.eyebrow),
    heroImage: String(src.heroImage || ""),
    ctaLabel: asLocalizedForm(src.ctaLabel),
    ctaHref: String(src.ctaHref || "/contact"),
    sections: src.sections || [],
    subsections,
  };
}

function toApi(draft: HubDraft, includeSubs: boolean): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: asLocalizedForm(draft.title),
    description: asLocalizedForm(draft.description),
    eyebrow: asLocalizedForm(draft.eyebrow),
    heroImage: draft.heroImage.trim(),
    ctaLabel: asLocalizedForm(draft.ctaLabel),
    ctaHref: draft.ctaHref.trim() || "/contact",
    sections: sectionsToApiPayload(sectionsFromApi(draft.sections)),
  };
  if (includeSubs) {
    const subsections: Record<string, unknown> = {};
    for (const row of KITCHEN_SUBS) {
      subsections[row.key] = toApi(draft.subsections?.[row.key] || emptyHub(), false);
    }
    payload.subsections = subsections;
  }
  return payload;
}

function TextField({
  label,
  value,
  locale,
  onChange,
  multiline,
}: {
  label: string;
  value: LocalizedText;
  locale: LocaleCode;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
}) {
  const cls =
    "mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm";
  return (
    <label className="block text-xs font-semibold text-[#5C6370]">
      {label} ({locale.toUpperCase()})
      {multiline ? (
        <textarea
          rows={3}
          value={localizedValue(value, locale)}
          onChange={(e) => onChange(writeLocalized(value, locale, e.target.value))}
          className={cls}
        />
      ) : (
        <input
          value={localizedValue(value, locale)}
          onChange={(e) => onChange(writeLocalized(value, locale, e.target.value))}
          className={cls}
        />
      )}
    </label>
  );
}

function HubFields({
  draft,
  locale,
  onChange,
  prefix,
}: {
  draft: HubDraft;
  locale: LocaleCode;
  onChange: (next: HubDraft) => void;
  prefix: string;
}) {
  return (
    <div className="space-y-3">
      <TextField
        label={`${prefix} heading`}
        value={draft.title}
        locale={locale}
        onChange={(title) => onChange({ ...draft, title })}
      />
      <TextField
        label={`${prefix} description`}
        value={draft.description}
        locale={locale}
        multiline
        onChange={(description) => onChange({ ...draft, description })}
      />
      <TextField
        label={`${prefix} tag (small uppercase)`}
        value={draft.eyebrow}
        locale={locale}
        onChange={(eyebrow) => onChange({ ...draft, eyebrow })}
      />
      <MediaUpload
        label={`${prefix} background image`}
        value={draft.heroImage}
        onChange={(heroImage) => onChange({ ...draft, heroImage })}
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <TextField
          label={`${prefix} button label`}
          value={draft.ctaLabel}
          locale={locale}
          onChange={(ctaLabel) => onChange({ ...draft, ctaLabel })}
        />
        <label className="block text-xs font-semibold text-[#5C6370]">
          {prefix} button link
          <input
            value={draft.ctaHref}
            onChange={(e) => onChange({ ...draft, ctaHref: e.target.value })}
            placeholder="/contact"
            className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
          />
        </label>
      </div>
      <SectionBlocksEditor
        locale={locale}
        label={`${prefix} content sections`}
        sections={sectionsFromApi(draft.sections)}
        onChange={(sections) =>
          onChange({ ...draft, sections: sectionsToApiPayload(sections) })
        }
      />
    </div>
  );
}

export default function HubLandingEditor({ hub }: { hub: AdminHubMeta }) {
  const { siteId } = useAdminAuth();
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [homeSections, setHomeSections] = useState<Record<string, unknown>>({});
  const [draft, setDraft] = useState<HubDraft>(emptyHub());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kitchenTab, setKitchenTab] = useState<"overview" | string>("overview");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHome(siteId);
      const sections = (res.home?.sections || {}) as Record<string, unknown>;
      setHomeSections(sections);
      const hubs = (sections.hubPages || {}) as Record<string, Record<string, unknown>>;
      setDraft(fromApi(hubs[hub.key], hub.key === "kitchens"));
    } catch {
      toast.error("Failed to load page hero");
    } finally {
      setLoading(false);
    }
  }, [siteId, hub.key]);

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
      const existingHubs = {
        ...((homeSections.hubPages || {}) as Record<string, unknown>),
      };
      const next = {
        ...homeSections,
        hubPages: {
          ...existingHubs,
          [hub.key]: toApi(draft, hub.key === "kitchens"),
        },
      };
      await updateHome(siteId, next);
      setHomeSections(next);
      toast.success(`${hub.label} page saved`);
    } catch {
      toast.error("Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#E8EDF2] bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1A2332]">
            {hub.label} page hero{" "}
            <span className="font-mono text-xs font-normal text-[#6B7280]">
              {hub.sitePath}
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
        <button
          type="button"
          disabled={saving || loading}
          onClick={() => void save()}
          className="rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
        >
          {saving ? "Saving…" : `Save ${hub.label} page`}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#6B7280]">Loading page fields…</p>
      ) : hub.key === "kitchens" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setKitchenTab("overview")}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                kitchenTab === "overview"
                  ? "border-[#1A2332] bg-[#1A2332] text-white"
                  : "border-[#E8EDF2] bg-[#F8FAFC] text-[#1A2332] hover:border-[#D8D2C8]"
              }`}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
                kitchenTab === "overview" ? "text-white/70" : "text-[#6B7280]"
              }`}>
                Overview
              </p>
              <p className="mt-1 text-sm font-bold leading-snug">Kitchens</p>
              <p className={`mt-0.5 font-mono text-[10px] ${
                kitchenTab === "overview" ? "text-white/55" : "text-[#9CA3AF]"
              }`}>
                /kitchens
              </p>
            </button>
            {KITCHEN_SUBS.map((row) => {
              const active = kitchenTab === row.key;
              return (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => setKitchenTab(row.key)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? "border-[#1A2332] bg-[#1A2332] text-white"
                      : "border-[#E8EDF2] bg-[#F8FAFC] text-[#1A2332] hover:border-[#D8D2C8]"
                  }`}
                >
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
                    active ? "text-white/70" : "text-[#B38B6D]"
                  }`}>
                    {row.tag}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-snug">{row.label}</p>
                  <p className={`mt-0.5 font-mono text-[10px] ${
                    active ? "text-white/55" : "text-[#9CA3AF]"
                  }`}>
                    {row.path}
                  </p>
                </button>
              );
            })}
          </div>

          {kitchenTab === "overview" ? (
            <HubFields draft={draft} locale={locale} onChange={setDraft} prefix="Hero" />
          ) : (
            <HubFields
              draft={draft.subsections?.[kitchenTab] || emptyHub()}
              locale={locale}
              prefix={
                KITCHEN_SUBS.find((r) => r.key === kitchenTab)?.label || "Hero"
              }
              onChange={(nextSub) =>
                setDraft({
                  ...draft,
                  subsections: {
                    ...(draft.subsections || {}),
                    [kitchenTab]: nextSub,
                  },
                })
              }
            />
          )}
        </>
      ) : (
        <HubFields draft={draft} locale={locale} onChange={setDraft} prefix="Hero" />
      )}
    </div>
  );
}
