"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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
  updateVarsoviaSite,
  varsoviaErrorMessage,
} from "@/services/varsoviaAPI";
import { IA_HUB_PATHS } from "@/app/varsovia/iaPagesDefaults";

const HUB_KEY = "journal";

type IaChildRow = {
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

function slugifyPreview(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function liveChildPath(slug: string) {
  const base = IA_HUB_PATHS[HUB_KEY] || "/journal";
  return `${base}/${slug}`;
}

function emptyChild(order: number): IaChildRow {
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
      ctaLabel: asLocalizedForm("Get a consultation"),
      ctaHref: "/contact",
    },
    body: emptyLocalized(),
    indexable: false,
    order,
    sections: [],
  };
}

export default function VarsoviaJournalPage() {
  const [pages, setPages] = useState<Record<string, unknown>>({});
  const [children, setChildren] = useState<IaChildRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draftSlug, setDraftSlug] = useState("");
  const [draftChild, setDraftChild] = useState<IaChildRow>(emptyChild(0));
  const [locale, setLocale] = useState<LocaleCode>("en");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const site = await getVarsoviaSite();
      const allPages = (site.pages || {}) as Record<string, Record<string, unknown>>;
      setPages(allPages);
      const hub = allPages[HUB_KEY] || {};
      const list = Array.isArray(hub.children) ? (hub.children as IaChildRow[]) : [];
      setChildren(
        [...list].sort(
          (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)
        )
      );
    } catch (err) {
      toast.error(varsoviaErrorMessage(err, "Failed to load journal pages"));
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return children;
    return children.filter((item) => {
      const title = localizedValue(item.title, "en").toLowerCase();
      const path = liveChildPath(item.slug || "").toLowerCase();
      return title.includes(q) || path.includes(q);
    });
  }, [children, query]);

  const persistChildren = async (nextChildren: IaChildRow[]) => {
    setSaving(true);
    try {
      const existing = (pages[HUB_KEY] || {}) as Record<string, unknown>;
      const nextPages = {
        ...pages,
        [HUB_KEY]: {
          ...existing,
          children: nextChildren.map((item, index) => ({
            ...item,
            order: index,
          })),
        },
      };
      await updateVarsoviaSite({ pages: nextPages });
      setPages(nextPages);
      setChildren(nextChildren.map((item, index) => ({ ...item, order: index })));
      toast.success("Journal sub-page saved");
    } catch (err) {
      toast.error(varsoviaErrorMessage(err, "Save failed"));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setDraftSlug("");
    setDraftChild(emptyChild(children.length));
    setEditIndex(null);
    setLocale("en");
    setModal("create");
  };

  const openEdit = (index: number) => {
    const item = children[index];
    setDraftSlug(item.slug || "");
    setDraftChild(JSON.parse(JSON.stringify(item)) as IaChildRow);
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
    if (!localizedValue(draftChild.title, "en").trim()) {
      toast.error("English title is required");
      return;
    }

    const nextChild: IaChildRow = { ...draftChild, slug };
    const duplicate = children.some(
      (item, index) =>
        item.slug === slug && (modal === "create" || index !== editIndex)
    );
    if (duplicate) {
      toast.error("Another sub-page already uses this slug");
      return;
    }

    try {
      let next: IaChildRow[];
      if (modal === "create") {
        next = [...children, nextChild];
      } else if (editIndex !== null) {
        next = children.map((item, index) =>
          index === editIndex ? nextChild : item
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
    const label = localizedValue(item.title, "en") || item.slug;
    if (!confirm(`Delete sub-page "${label}"?`)) return;
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
          hubKey={HUB_KEY}
          label="Journal"
          onSaved={() => void load()}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search journal sub-pages…"
              className="w-full rounded-xl border border-[#E2E5EA] bg-white pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/15"
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1A2332] text-white px-4 py-2.5 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Journal page
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[#6B7280]">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E2E5EA] bg-white p-12 text-center">
            <FolderOpen className="w-8 h-8 text-[#9CA3AF] mx-auto mb-3" />
            <p className="text-sm text-[#6B7280]">No journal sub-pages yet</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const index = children.indexOf(item);
              return (
                <div
                  key={item.slug || index}
                  className="rounded-2xl border border-[#E8EAED] bg-white p-4 flex gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#1A2332]">
                      {localizedValue(item.title, "en") || item.slug}
                    </p>
                    <p className="mt-1 text-[11px] font-mono text-[#9CA3AF]">
                      {liveChildPath(item.slug || "slug")}
                    </p>
                    <p className="mt-1 text-sm text-[#6B7280] line-clamp-2">
                      {localizedValue(item.body, "en")}
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
              );
            })}
          </div>
        )}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <form
            onSubmit={(e) => void onSubmit(e)}
            className="w-full max-w-3xl rounded-2xl bg-white p-6 space-y-4 shadow-xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#1A2332]">
                {modal === "create" ? "Add Journal sub-page" : "Edit Journal sub-page"}
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
                        .replace(/-+/g, "-")
                    )
                  }
                  placeholder="kitchens"
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
                        "your-slug"
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
              hubKey={HUB_KEY}
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
