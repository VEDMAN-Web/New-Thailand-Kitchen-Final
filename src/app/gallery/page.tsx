"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Images, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import LocaleTabs from "@/components/LocaleTabs";
import MediaUpload from "@/components/MediaUpload";
import AdminSkeleton from "@/components/AdminSkeleton";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { CMS_SYNCED_EVENT } from "@/lib/adminSectionNav";
import { resolveAdminMediaPreviewUrl } from "@/lib/adminMediaPreview";
import {
  asLocalizedForm,
  emptyLocalized,
  localizedValue,
  writeLocalized,
  type LocaleCode,
  type LocalizedText,
} from "@/lib/localized";
import {
  createGalleryItem,
  deleteGalleryItem,
  getHome,
  listGallery,
  updateGalleryItem,
  updateHome,
  type GalleryCmsItem,
} from "@/services/adminAPI";

const DEFAULT_FILTERS: { id: string; label: LocalizedText }[] = [
  { id: "All", label: asLocalizedForm("All") },
  { id: "Layout & Space", label: asLocalizedForm("Layout & Space") },
  { id: "Storage", label: asLocalizedForm("Storage") },
  { id: "Style & Color", label: asLocalizedForm("Style & Color") },
  { id: "Materials", label: asLocalizedForm("Materials") },
];

type GalleryForm = {
  title: LocalizedText;
  image: string;
  filter: string;
  tall: boolean;
  wide: boolean;
  sortOrder: number;
  locationTag: string;
  layoutTag: string;
  styleTag: string;
  materialTag: string;
  propertyType: string;
  projectTitle: string;
  projectDesc: string;
};

const emptyForm: GalleryForm = {
  title: emptyLocalized(),
  image: "",
  filter: "Style & Color",
  tall: false,
  wide: false,
  sortOrder: 0,
  locationTag: "",
  layoutTag: "",
  styleTag: "",
  materialTag: "",
  propertyType: "",
  projectTitle: "",
  projectDesc: "",
};

type HeroForm = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  collage1: string;
  collage2: string;
  collage3: string;
  collage4: string;
};

const emptyHero: HeroForm = {
  eyebrow: emptyLocalized(),
  title: emptyLocalized(),
  description: emptyLocalized(),
  collage1: "",
  collage2: "",
  collage3: "",
  collage4: "",
};

export default function AdminGalleryPage() {
  const { siteId } = useAdminAuth();
  const [items, setItems] = useState<GalleryCmsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [hero, setHero] = useState<HeroForm>(emptyHero);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sections, setSections] = useState<Record<string, unknown>>({});
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<GalleryCmsItem | null>(null);
  const [form, setForm] = useState<GalleryForm>(emptyForm);
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [listFilter, setListFilter] = useState<string>("All");
  const loadSeqRef = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    setLoading(true);
    try {
      const [galleryRes, homeRes] = await Promise.all([
        listGallery(siteId),
        getHome(siteId),
      ]);
      if (seq !== loadSeqRef.current) return;
      setItems(galleryRes.items || []);
      const nextSections = homeRes.home?.sections || {};
      setSections(nextSections);
      const gp = (nextSections.galleryPage || {}) as {
        eyebrow?: unknown;
        title?: unknown;
        description?: unknown;
        collage?: string[];
        filters?: { id?: string; label?: unknown }[];
      };
      const collage = gp.collage || [];
      setHero({
        eyebrow: asLocalizedForm(gp.eyebrow),
        title: asLocalizedForm(gp.title),
        description: asLocalizedForm(gp.description),
        collage1: collage[0] || "",
        collage2: collage[1] || "",
        collage3: collage[2] || "",
        collage4: collage[3] || "",
      });
      const nextFilters = (gp.filters || [])
        .map((f) => ({
          id: String(f.id || "").trim(),
          label: asLocalizedForm(f.label || f.id || ""),
        }))
        .filter((f) => f.id);
      setFilters(nextFilters.length ? nextFilters : DEFAULT_FILTERS);
    } catch {
      if (seq !== loadSeqRef.current) return;
      toast.error("Failed to load gallery");
    } finally {
      if (seq === loadSeqRef.current) setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => {
      void load();
    };
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { All: items.length };
    for (const f of filters) {
      if (f.id === "All") continue;
      counts[f.id] = items.filter((i) => i.filter === f.id).length;
    }
    return counts;
  }, [items, filters]);

  const visibleItems = useMemo(() => {
    const list =
      listFilter === "All"
        ? items
        : items.filter((i) => i.filter === listFilter);
    return [...list].sort(
      (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
    );
  }, [items, listFilter]);

  const persistGalleryPage = async (
    nextFilters: { id: string; label: LocalizedText }[],
    extra?: Partial<HeroForm>
  ) => {
    const h = extra ? { ...hero, ...extra } : hero;
    const collage = [h.collage1, h.collage2, h.collage3, h.collage4]
      .map((s) => s.trim())
      .filter(Boolean);
    const next = {
      ...sections,
      galleryPage: {
        eyebrow: asLocalizedForm(h.eyebrow),
        title: asLocalizedForm(h.title),
        description: asLocalizedForm(h.description),
        collage,
        filters: nextFilters
          .map((f) => ({
            id: f.id.trim(),
            label: asLocalizedForm(f.label, f.id.trim()),
          }))
          .filter((f) => f.id),
      },
    };
    await updateHome(siteId, next);
    setSections(next);
    setFilters(nextFilters);
  };

  const addFilter = async () => {
    const used = new Set(filters.map((f) => f.id.trim().toLowerCase()));
    let n = 1;
    let id = "New filter";
    while (used.has(id.toLowerCase())) {
      n += 1;
      id = `New filter ${n}`;
    }
    const next = [...filters, { id, label: asLocalizedForm(id) }];
    try {
      await persistGalleryPage(next);
      toast.success("Filter added — it now appears on /gallery");
    } catch {
      toast.error("Could not add filter");
    }
  };

  const removeFilter = async (index: number) => {
    const row = filters[index];
    if (!row || row.id === "All") return;
    const count = filterCounts[row.id] ?? 0;
    if (
      !confirm(
        count
          ? `Remove “${localizedValue(row.label, "en") || row.id}”? ${count} photo(s) stay in All until you recategorize them.`
          : `Remove “${localizedValue(row.label, "en") || row.id}”?`
      )
    ) {
      return;
    }
    const next = filters.filter((_, i) => i !== index);
    if (listFilter === row.id) setListFilter("All");
    try {
      await persistGalleryPage(next);
      toast.success("Filter removed from admin and /gallery");
    } catch {
      toast.error("Could not remove filter");
    }
  };

  const saveHero = async () => {
    if (!localizedValue(hero.title, "en").trim()) {
      toast.error("English gallery heading is required");
      return;
    }
    setSavingHero(true);
    try {
      await persistGalleryPage(filters);
      toast.success("Gallery page content saved");
    } catch {
      toast.error("Failed to save gallery content");
    } finally {
      setSavingHero(false);
    }
  };

  const openCreate = () => {
    setForm({
      ...emptyForm,
      filter:
        listFilter !== "All"
          ? listFilter
          : filters.find((f) => f.id !== "All")?.id || "Style & Color",
      sortOrder: items.length + 1,
    });
    setEditing(null);
    setLocale("en");
    setModal("create");
  };

  const openEdit = (item: GalleryCmsItem) => {
    setEditing(item);
    setForm({
      title: asLocalizedForm(item.title),
      image: item.image,
      filter: item.filter || "Style & Color",
      tall: Boolean(item.tall),
      wide: Boolean(item.wide),
      sortOrder: Number(item.sortOrder) || 0,
      locationTag: (item as any).locationTag || "",
      layoutTag: (item as any).layoutTag || "",
      styleTag: (item as any).styleTag || "",
      materialTag: (item as any).materialTag || "",
      propertyType: (item as any).propertyType || "",
      projectTitle: (item as any).projectTitle || "",
      projectDesc: (item as any).projectDesc || "",
    });
    setLocale("en");
    setModal("edit");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.image) {
      toast.error("Please upload an image");
      return;
    }
    if (form.projectDesc && form.projectDesc.length > 300) {
      toast.error("Project Description must be 300 characters or less");
      return;
    }
    try {
      const payload: any = {
        ...form,
        title: asLocalizedForm(form.title),
      };
      if (modal === "create") {
        await createGalleryItem(siteId, payload);
        toast.success("Gallery item created");
      } else if (editing) {
        await updateGalleryItem(siteId, editing._id, payload);
        toast.success("Gallery item updated");
      }
      setModal(null);
      await load();
    } catch {
      toast.error("Save failed");
    }
  };

  const onDelete = async (item: GalleryCmsItem) => {
    if (!confirm(`Delete "${localizedValue(item.title, "en")}"?`)) return;
    try {
      await deleteGalleryItem(siteId, item._id);
      toast.success("Deleted");
      await load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-[#E8EAED] p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#1A2332]">
                1 · Gallery page hero
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Top of /gallery — eyebrow, heading, description, collage.
              </p>
              <div className="mt-3">
                <LocaleTabs locale={locale} onChange={setLocale} />
              </div>
            </div>
            <button
              type="button"
              disabled={savingHero || loading}
              onClick={saveHero}
              className="rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
            >
              {savingHero ? "Saving…" : "Save"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-[#5C6370]">
              Eyebrow ({locale.toUpperCase()})
              <input
                value={localizedValue(hero.eyebrow, locale)}
                onChange={(e) =>
                  setHero({
                    ...hero,
                    eyebrow: writeLocalized(hero.eyebrow, locale, e.target.value),
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-semibold text-[#5C6370]">
              Main heading ({locale.toUpperCase()}) *
              <input
                value={localizedValue(hero.title, locale)}
                onChange={(e) =>
                  setHero({
                    ...hero,
                    title: writeLocalized(hero.title, locale, e.target.value),
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-[#5C6370]">
            Description ({locale.toUpperCase()})
            <textarea
              rows={4}
              value={localizedValue(hero.description, locale)}
              onChange={(e) =>
                setHero({
                  ...hero,
                  description: writeLocalized(
                    hero.description,
                    locale,
                    e.target.value
                  ),
                })
              }
              className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
            />
          </label>

          <div>
            <p className="text-xs font-semibold text-[#5C6370] mb-1">
              Hero collage images
            </p>
            <p className="text-[11px] text-[#9CA3AF] mb-2">
              Shown in the scrolling collage beside the heading on /gallery.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {(
                [
                  ["collage1", "Collage 1 · top-left"],
                  ["collage2", "Collage 2 · top-right"],
                  ["collage3", "Collage 3 · bottom-left"],
                  ["collage4", "Collage 4 · bottom-right"],
                ] as const
              ).map(([key, label]) => (
                <MediaUpload
                  key={key}
                  label={label}
                  kind="image"
                  value={hero[key]}
                  onChange={(v) => setHero({ ...hero, [key]: v })}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-[#E8EAED] pt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#5C6370]">
                Filter tab labels ({locale.toUpperCase()})
              </p>
              <button
                type="button"
                onClick={() => void addFilter()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E5EA] bg-white px-3 py-1.5 text-xs font-semibold text-[#1A2332] hover:bg-[#F8FAFC]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add filter
              </button>
            </div>
            <p className="text-[11px] text-[#9CA3AF]">
              Tabs on /gallery. Add a filter, rename the label, then assign photos to it.
            </p>
            {filters.map((f, i) => (
              <div
                key={f.id + i}
                className="grid sm:grid-cols-[140px_1fr_auto_auto] gap-3 items-end"
              >
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Id
                  <input
                    value={f.id}
                    readOnly={f.id === "All"}
                    onChange={(e) => {
                      const next = [...filters];
                      next[i] = { ...f, id: e.target.value };
                      setFilters(next);
                    }}
                    className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal bg-[#F8FAFC]"
                  />
                </label>
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Label
                  <input
                    value={localizedValue(f.label, locale)}
                    onChange={(e) => {
                      const next = [...filters];
                      next[i] = {
                        ...f,
                        label: writeLocalized(f.label, locale, e.target.value),
                      };
                      setFilters(next);
                    }}
                    className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                  />
                </label>
                <p className="text-xs text-[#6B7280] pb-2.5 whitespace-nowrap">
                  {filterCounts[f.id] ?? 0} photos
                </p>
                {f.id === "All" ? (
                  <span className="pb-2.5 text-[11px] text-[#9CA3AF]">Locked</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void removeFilter(i)}
                    className="mb-1 inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50"
                    aria-label={`Remove ${f.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#1A2332]">
              2 · Gallery photos ({items.length})
            </h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Same images as the public /gallery grid. Filter tabs match the
              site.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-4 py-2.5"
          >
            <Plus className="w-4 h-4" />
            Add photo
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "All", label: "All" as string | LocalizedText },
            ...filters.filter((f) => f.id !== "All"),
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setListFilter(f.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border ${
                listFilter === f.id
                  ? "bg-[#1A2332] text-white border-[#1A2332]"
                  : "bg-white text-[#5C6370] border-[#E2E5EA]"
              }`}
            >
              {typeof f.label === "string"
                ? f.label
                : localizedValue(f.label, "en") || f.id}{" "}
              <span className="opacity-70">{filterCounts[f.id] ?? 0}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <AdminSkeleton variant="cards" count={6} />
        ) : visibleItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E8EAED] p-10 text-center text-[#6B7280]">
            <Images className="w-8 h-8 mx-auto mb-3 opacity-40" />
            No photos in this filter. Add one or switch tab.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleItems.map((item, index) => {
              const preview = resolveAdminMediaPreviewUrl(item.image);
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden flex flex-col"
                >
                  <div className="relative h-44 bg-[#F3F4F6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview || "/products/Kitchen1.png"}
                      alt={localizedValue(item.title, "en")}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                      #{index + 1}
                      {item.sortOrder ? ` · sort ${item.sortOrder}` : ""}
                    </span>
                    <div className="absolute right-2 top-2 flex gap-1">
                      {item.tall ? (
                        <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-[#1A2332]">
                          TALL
                        </span>
                      ) : null}
                      {item.wide ? (
                        <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-[#1A2332]">
                          WIDE
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="font-semibold text-[#1A2332]">
                      {localizedValue(item.title, "en") || "Untitled"}
                    </p>
                    <p className="text-xs font-medium text-[#B38B6D] mt-1">
                      Filter: {item.filter || "—"}
                    </p>
                    {(item as any).projectTitle ? (
                      <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                        {(item as any).projectTitle}
                      </p>
                    ) : null}
                    <div className="flex justify-end gap-1 mt-auto pt-3">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E2E5EA] px-2.5 py-1.5 text-xs font-semibold hover:bg-[#F3F4F6]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal ? (
        <div className="tk-overlay">
          <form
            onSubmit={onSubmit}
            className="tk-sheet w-full max-w-lg bg-white p-4 sm:p-6 space-y-3"
          >
            <div className="flex justify-between items-center mb-2 gap-3">
              <div>
                <h3 className="font-bold text-lg">
                  {modal === "create"
                    ? "Add gallery photo"
                    : "Edit gallery photo"}
                </h3>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Changes appear on /gallery after save.
                </p>
                <div className="mt-2">
                  <LocaleTabs locale={locale} onChange={setLocale} />
                </div>
              </div>
              <button type="button" onClick={() => setModal(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <label className="block text-xs font-semibold text-[#5C6370]">
              Title ({locale.toUpperCase()})
              <input
                value={localizedValue(form.title, locale)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: writeLocalized(form.title, locale, e.target.value),
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
              />
            </label>
            <MediaUpload
              label="Photo (shown in gallery grid)"
              kind="image"
              value={form.image}
              onChange={(v) => setForm({ ...form, image: v })}
              previewSize="lg"
            />
            <label className="block text-xs font-semibold text-[#5C6370]">
              Site filter tab
              <select
                value={form.filter}
                onChange={(e) => setForm({ ...form, filter: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
              >
                {filters
                  .filter((f) => f.id !== "All")
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {localizedValue(f.label, "en") || f.id}
                    </option>
                  ))}
              </select>
            </label>

            {locale === "en" ? (
              <>
                <div className="rounded-xl border border-[#E8EDF2] bg-[#F8FAFC] p-3 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
                    Layout on site
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm text-[#1A2332]">
                      <input
                        type="checkbox"
                        checked={form.tall}
                        onChange={(e) =>
                          setForm({ ...form, tall: e.target.checked })
                        }
                        className="rounded border-[#E2E5EA]"
                      />
                      Tall tile
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#1A2332]">
                      <input
                        type="checkbox"
                        checked={form.wide}
                        onChange={(e) =>
                          setForm({ ...form, wide: e.target.checked })
                        }
                        className="rounded border-[#E2E5EA]"
                      />
                      Wide tile
                    </label>
                  </div>
                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Sort order (lower = earlier)
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sortOrder: Number(e.target.value) || 0,
                        })
                      }
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                </div>

                <div className="border-t border-[#E8EAED] pt-3 mt-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#334155] mb-3">
                    Project metadata & taxonomy
                  </p>
                </div>

                <label className="block text-xs font-semibold text-[#5C6370]">
                  Project Title
                  <input
                    value={form.projectTitle}
                    onChange={(e) =>
                      setForm({ ...form, projectTitle: e.target.value })
                    }
                    placeholder="e.g. Modern Villa Kitchen - Phuket"
                    className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                  />
                </label>

                <label className="block text-xs font-semibold text-[#5C6370]">
                  Project Description ({form.projectDesc.length}/300)
                  <textarea
                    rows={3}
                    value={form.projectDesc}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        projectDesc: e.target.value.slice(0, 300),
                      })
                    }
                    placeholder="Brief project description (max 300 chars)"
                    maxLength={300}
                    className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal resize-y"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Location Tag
                    <input
                      value={form.locationTag}
                      onChange={(e) =>
                        setForm({ ...form, locationTag: e.target.value })
                      }
                      placeholder="e.g. Bangkok"
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Layout Tag
                    <input
                      value={form.layoutTag}
                      onChange={(e) =>
                        setForm({ ...form, layoutTag: e.target.value })
                      }
                      placeholder="e.g. L-shaped"
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Style Tag
                    <input
                      value={form.styleTag}
                      onChange={(e) =>
                        setForm({ ...form, styleTag: e.target.value })
                      }
                      placeholder="e.g. Modern"
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Material Tag
                    <input
                      value={form.materialTag}
                      onChange={(e) =>
                        setForm({ ...form, materialTag: e.target.value })
                      }
                      placeholder="e.g. Marble"
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                </div>

                <label className="block text-xs font-semibold text-[#5C6370]">
                  Property Type
                  <input
                    value={form.propertyType}
                    onChange={(e) =>
                      setForm({ ...form, propertyType: e.target.value })
                    }
                    placeholder="e.g. Villa"
                    className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                  />
                </label>
              </>
            ) : null}

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
                className="rounded-lg bg-[#1A2332] text-white px-4 py-2 text-sm font-semibold"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
