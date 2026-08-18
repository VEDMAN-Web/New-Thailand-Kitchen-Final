"use client";

import { FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FolderOpen, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import LocaleTabs from "@/components/LocaleTabs";
import VarsoviaHubLandingEditor from "@/components/VarsoviaHubLandingEditor";
import IaChildrenListEditor from "@/app/varsovia/IaChildrenListEditor";
import { CMS_SYNCED_EVENT } from "@/lib/adminSectionNav";
import {
  asLocalizedForm,
  emptyLocalized,
  localizedValue,
  type LocaleCode,
} from "@/lib/localized";
import {
  getVarsoviaSite,
  varsoviaErrorMessage,
} from "@/services/varsoviaAPI";
import { IA_HUB_PATHS } from "@/app/varsovia/iaPagesDefaults";
import { mergeIaPagesFromLiveSite } from "@/app/varsovia/mergeIaPages";
import { persistIaHubChildren } from "@/app/varsovia/persistIaHub";
import { resolveAdminMediaPreviewUrl } from "@/lib/adminMediaPreview";

export type IaChildRow = {
  slug: string;
  title?: unknown;
  metaTitle?: unknown;
  metaDescription?: unknown;
  body?: unknown;
  relatedTitle?: unknown;
  indexable?: boolean;
  order?: number;
  sections?: unknown[];
  hero?: {
    eyebrow?: unknown;
    title?: unknown;
    subtitle?: unknown;
    image?: string;
    ctaLabel?: unknown;
    ctaHref?: string;
  };
};

export type VarsoviaIaChildrenHubConfig = {
  hubKey: string;
  label: string;
  pathLabel: string;
  helpText: string;
  itemNoun: string;
  addLabel: string;
  searchPlaceholder: string;
  emptyLabel: string;
  slugPlaceholder: string;
  cardFallbackImage: string;
  savedToast: string;
  loadError: string;
  showExplore?: boolean;
  showChildren?: boolean;
  hideSlugs?: string[];
  childPath?: (slug: string) => string;
  extraAfterCards?: ReactNode;
  defaultRelatedTitle?: string;
  defaultCtaLabel?: string;
  defaultCtaHref?: string;
  blockedSlug?: { slug: string; message: string };
};

function slugifyPreview(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function withFilledLocales(value: unknown, fallbackEn = "") {
  const map = asLocalizedForm(value);
  const en = map.en.trim() || fallbackEn;
  return {
    en,
    th: map.th.trim() || en,
    pl: map.pl.trim() || en,
  };
}

function fillChildLocaleTabs(
  child: IaChildRow,
  defaultCtaLabel: string,
): IaChildRow {
  const hero = child.hero || {};
  return {
    ...child,
    title: withFilledLocales(child.title),
    metaTitle: withFilledLocales(child.metaTitle),
    metaDescription: withFilledLocales(child.metaDescription),
    body: withFilledLocales(child.body),
    relatedTitle: withFilledLocales(child.relatedTitle),
    hero: {
      ...hero,
      eyebrow: withFilledLocales(hero.eyebrow),
      title: withFilledLocales(hero.title),
      subtitle: withFilledLocales(hero.subtitle),
      ctaLabel: withFilledLocales(hero.ctaLabel, defaultCtaLabel),
    },
    sections: (Array.isArray(child.sections) ? child.sections : []).map((sec) => {
      const row = sec && typeof sec === "object" ? (sec as Record<string, unknown>) : {};
      return {
        ...row,
        heading: withFilledLocales(row.heading),
        text: withFilledLocales(row.text),
      };
    }),
  };
}

function emptyChild(
  order: number,
  defaultCtaLabel: string,
  defaultCtaHref: string,
  defaultRelatedTitle: string,
): IaChildRow {
  return {
    slug: "",
    title: emptyLocalized(),
    metaTitle: emptyLocalized(),
    metaDescription: emptyLocalized(),
    hero: {
      eyebrow: emptyLocalized(),
      title: emptyLocalized(),
      subtitle: emptyLocalized(),
      image: "",
      ctaLabel: {
        en: defaultCtaLabel,
        th: defaultCtaLabel,
        pl: defaultCtaLabel,
      },
      ctaHref: defaultCtaHref,
    },
    body: emptyLocalized(),
    relatedTitle: defaultRelatedTitle
      ? {
          en: defaultRelatedTitle,
          th: defaultRelatedTitle,
          pl: defaultRelatedTitle,
        }
      : emptyLocalized(),
    indexable: false,
    order,
    sections: [],
  };
}

export default function VarsoviaIaChildrenHubPage({
  hubKey,
  label,
  pathLabel,
  helpText,
  itemNoun,
  addLabel,
  searchPlaceholder,
  emptyLabel,
  slugPlaceholder,
  cardFallbackImage,
  savedToast,
  loadError,
  showExplore = true,
  showChildren = true,
  hideSlugs = [],
  childPath,
  extraAfterCards,
  defaultRelatedTitle = "",
  defaultCtaLabel = "Get a consultation",
  defaultCtaHref = "/contact",
  blockedSlug,
}: VarsoviaIaChildrenHubConfig) {
  const [children, setChildren] = useState<IaChildRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draftSlug, setDraftSlug] = useState("");
  const [draftChild, setDraftChild] = useState<IaChildRow>(
    emptyChild(0, defaultCtaLabel, defaultCtaHref, defaultRelatedTitle),
  );
  const [locale, setLocale] = useState<LocaleCode>("en");
  const hasLoadedRef = useRef(false);
  const hidden = useMemo(
    () => new Set(hideSlugs.map((s) => s.toLowerCase())),
    [hideSlugs],
  );

  const liveChildPath = useCallback(
    (slug: string) => {
      if (childPath) return childPath(slug);
      const base = IA_HUB_PATHS[hubKey] || `/${hubKey}`;
      return `${base}/${slug}`;
    },
    [childPath, hubKey],
  );

  const isHidden = useCallback(
    (slug: string) => hidden.has(String(slug || "").toLowerCase()),
    [hidden],
  );

  const load = useCallback(async () => {
    if (!hasLoadedRef.current) setLoading(true);
    try {
      const site = await getVarsoviaSite();
      const allPages = mergeIaPagesFromLiveSite(site.pages);
      const hub = (allPages[hubKey] || {}) as Record<string, unknown>;
      const list = Array.isArray(hub.children) ? (hub.children as IaChildRow[]) : [];
      setChildren(
        [...list].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)),
      );
      hasLoadedRef.current = true;
    } catch (err) {
      toast.error(varsoviaErrorMessage(err, loadError));
    } finally {
      setLoading(false);
    }
  }, [hubKey, loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => void load();
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const visibleChildren = useMemo(
    () => children.filter((item) => !isHidden(item.slug || "")),
    [children, isHidden],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visibleChildren;
    return visibleChildren.filter((item) => {
      const title = localizedValue(item.title, "en").toLowerCase();
      const path = liveChildPath(item.slug || "").toLowerCase();
      return title.includes(q) || path.includes(q);
    });
  }, [visibleChildren, query, liveChildPath]);

  const persistChildren = async (nextChildren: IaChildRow[]) => {
    setSaving(true);
    try {
      const allPages = await persistIaHubChildren(hubKey, nextChildren);
      const hub = (allPages[hubKey] || {}) as Record<string, unknown>;
      const list = Array.isArray(hub.children) ? (hub.children as IaChildRow[]) : [];
      setChildren(
        [...list].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)),
      );
      toast.success(savedToast);
    } catch (err) {
      toast.error(varsoviaErrorMessage(err, "Save failed"));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setDraftSlug("");
    setDraftChild(
      emptyChild(children.length, defaultCtaLabel, defaultCtaHref, defaultRelatedTitle),
    );
    setEditIndex(null);
    setLocale("en");
    setModal("create");
  };

  const openEdit = (index: number) => {
    const item = children[index];
    const copy = fillChildLocaleTabs(
      JSON.parse(JSON.stringify(item)) as IaChildRow,
      defaultCtaLabel,
    );
    if (!String(copy.hero?.ctaHref || "").trim()) {
      copy.hero = { ...(copy.hero || {}), ctaHref: defaultCtaHref };
    }
    setDraftSlug(item.slug || "");
    setDraftChild(copy);
    setEditIndex(index);
    setLocale("en");
    setModal("edit");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const slug =
      slugifyPreview(draftSlug) ||
      slugifyPreview(localizedValue(draftChild.title, "en"));
    if (!slug) {
      toast.error("Slug or English title is required");
      return;
    }
    if (blockedSlug && slug === blockedSlug.slug) {
      toast.error(blockedSlug.message);
      return;
    }
    if (isHidden(slug)) {
      toast.error(`“${slug}” is reserved — edit the hub above instead`);
      return;
    }
    if (!localizedValue(draftChild.title, "en").trim()) {
      toast.error("English title is required");
      return;
    }

    const nextChild: IaChildRow = fillChildLocaleTabs(
      { ...draftChild, slug },
      defaultCtaLabel,
    );
    const name =
      localizedValue(nextChild.title, "en") || nextChild.slug || itemNoun;
    if (!localizedValue(nextChild.metaTitle, "en").trim()) {
      nextChild.metaTitle = withFilledLocales(
        nextChild.metaTitle,
        `${name} | Varsovia Design`.slice(0, 60),
      );
    }
    if (!localizedValue(nextChild.metaDescription, "en").trim()) {
      const subtitle = localizedValue(nextChild.hero?.subtitle, "en");
      nextChild.metaDescription = withFilledLocales(
        nextChild.metaDescription,
        (subtitle
          ? `${name} by Varsovia Design — ${subtitle}`
          : `${name} by Varsovia Design.`
        ).slice(0, 160),
      );
    }
    if (
      defaultRelatedTitle &&
      !localizedValue(nextChild.relatedTitle, "en").trim()
    ) {
      nextChild.relatedTitle = withFilledLocales(
        nextChild.relatedTitle,
        defaultRelatedTitle,
      );
    }
    if (!String(nextChild.hero?.ctaHref || "").trim()) {
      nextChild.hero = { ...(nextChild.hero || {}), ctaHref: defaultCtaHref };
    }
    const duplicate = children.some(
      (item, index) =>
        item.slug === slug && (modal === "create" || index !== editIndex),
    );
    if (duplicate) {
      toast.error(`Another ${itemNoun} already uses this slug`);
      return;
    }

    try {
      let next: IaChildRow[];
      if (modal === "create") {
        next = [...children, nextChild];
      } else if (editIndex !== null) {
        next = children.map((item, index) =>
          index === editIndex ? nextChild : item,
        );
      } else {
        return;
      }
      await persistChildren(next);
      setModal(null);
    } catch {
      /* toast handled in persistChildren */
    }
  };

  const onDelete = async (index: number) => {
    const item = children[index];
    if (isHidden(item.slug || "")) return;
    const itemLabel = localizedValue(item.title, "en") || item.slug;
    if (!confirm(`Delete ${itemNoun} “${itemLabel}”?`)) return;
    try {
      await persistChildren(children.filter((_, i) => i !== index));
    } catch {
      /* toast handled */
    }
  };

  return (
    <>
      <div className="space-y-6">
        <VarsoviaHubLandingEditor
          hubKey={hubKey}
          label={label}
          pathLabel={pathLabel}
          helpText={helpText}
          showExplore={showExplore}
          onSaved={() => void load()}
        />

        {showChildren ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-xl border border-[#E2E5EA] bg-white pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/15"
                />
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1A2332] text-white px-4 py-2.5 text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                {addLabel}
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-[#6B7280]">Loading…</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E2E5EA] bg-white p-12 text-center">
                <FolderOpen className="w-8 h-8 text-[#9CA3AF] mx-auto mb-3" />
                <p className="text-sm text-[#6B7280]">{emptyLabel}</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((item) => {
                  const index = children.indexOf(item);
                  return (
                    <div
                      key={item.slug || index}
                      className="overflow-hidden rounded-2xl border border-[#E8EAED] bg-white"
                    >
                      <div className="relative h-36 w-full bg-[#F3F4F6]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveAdminMediaPreviewUrl(
                            String(item.hero?.image || "") || cardFallbackImage,
                          )}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <span
                          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            item.indexable === true
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-white/90 text-[#64748B]"
                          }`}
                        >
                          {item.indexable === true ? "In sitemap" : "Noindex"}
                        </span>
                      </div>
                      <div className="flex gap-3 p-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#1A2332]">
                            {localizedValue(item.title, "en") || item.slug}
                          </p>
                          <p className="mt-1 text-[11px] font-mono text-[#9CA3AF]">
                            {liveChildPath(item.slug || "slug")}
                          </p>
                          <p className="mt-1 text-sm text-[#6B7280] line-clamp-2">
                            {localizedValue(item.hero?.subtitle, "en") ||
                              localizedValue(item.body, "en")}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEdit(index)}
                            className="p-2 rounded-lg hover:bg-[#F4F5F7]"
                          >
                            <Pencil className="w-4 h-4 text-[#5C6370]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDelete(index)}
                            className="p-2 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}

        {extraAfterCards}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <form
            onSubmit={(e) => void onSubmit(e)}
            className="w-full max-w-3xl rounded-2xl bg-white p-6 space-y-4 shadow-xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#1A2332]">
                {modal === "create" ? addLabel : `Edit ${itemNoun}`}
              </h2>
              <button type="button" onClick={() => setModal(null)}>
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            <LocaleTabs locale={locale} onChange={setLocale} />

            {locale === "en" ? (
              <div>
                <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                  Slug (URL-safe, lowercase, hyphens only)
                </label>
                <input
                  value={draftSlug}
                  onChange={(e) =>
                    setDraftSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-"),
                    )
                  }
                  placeholder={slugPlaceholder}
                  className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm font-mono"
                  required={modal === "create"}
                  readOnly={modal === "edit"}
                />
                <p className="text-xs text-[#6B7280] mt-1">
                  Leave blank to auto-generate from English title
                </p>
                <div className="mt-2 rounded-lg border border-[#E2E5EA] bg-[#F8FAFC] px-3.5 py-2.5">
                  <p className="text-xs font-semibold text-[#5C6370] mb-1">
                    Live URL preview
                  </p>
                  <p className="text-sm font-mono text-[#1A2332] break-all">
                    {liveChildPath(
                      slugifyPreview(draftSlug) ||
                        slugifyPreview(localizedValue(draftChild.title, "en")) ||
                        "your-slug",
                    )}
                  </p>
                </div>
              </div>
            ) : null}

            <IaChildrenListEditor
              value={[draftChild]}
              onChange={(rows) => {
                if (rows[0]) setDraftChild(rows[0]);
              }}
              locale={locale}
              hubKey={hubKey}
              embedded
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-[#E2E5EA] px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#1A2332] text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
