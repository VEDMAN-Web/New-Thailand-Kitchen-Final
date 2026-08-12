"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Images, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import LocaleTabs from "@/components/LocaleTabs";
import MediaUpload from "@/components/MediaUpload";
import { useAdminAuth } from "@/lib/AdminAuthContext";
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [galleryRes, homeRes] = await Promise.all([
        listGallery(siteId),
        getHome(siteId),
      ]);
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
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveHero = async () => {
    if (!localizedValue(hero.title, "en").trim()) {
      toast.error("English gallery heading is required");
      return;
    }
    setSavingHero(true);
    try {
      const collage = [
        hero.collage1,
        hero.collage2,
        hero.collage3,
        hero.collage4,
      ]
        .map((s) => s.trim())
        .filter(Boolean);

      const next = {
        ...sections,
        galleryPage: {
          eyebrow: asLocalizedForm(hero.eyebrow),
          title: asLocalizedForm(hero.title),
          description: asLocalizedForm(hero.description),
          collage,
          filters: filters
            .map((f) => ({
              id: f.id.trim(),
              label: asLocalizedForm(f.label, f.id.trim()),
            }))
            .filter((f) => f.id),
        },
      };
      await updateHome(siteId, next);
      setSections(next);
      toast.success("Gallery page content saved");
    } catch {
      toast.error("Failed to save gallery content");
    } finally {
      setSavingHero(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
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
        <div className="bg-white rounded-xl border border-[#E8EAED] p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#1A2332]">
                Gallery Page Content
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Heading, paragraph and hero collage — edit per language.
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
              {savingHero ? "Saving…" : "Save Content"}
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
            <p className="text-xs font-semibold text-[#5C6370] mb-2">
              Hero collage images (optional)
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <MediaUpload
                label="Collage image 1"
                kind="image"
                value={hero.collage1}
                onChange={(v) => setHero({ ...hero, collage1: v })}
              />
              <MediaUpload
                label="Collage image 2"
                kind="image"
                value={hero.collage2}
                onChange={(v) => setHero({ ...hero, collage2: v })}
              />
              <MediaUpload
                label="Collage image 3"
                kind="image"
                value={hero.collage3}
                onChange={(v) => setHero({ ...hero, collage3: v })}
              />
              <MediaUpload
                label="Collage image 4"
                kind="image"
                value={hero.collage4}
                onChange={(v) => setHero({ ...hero, collage4: v })}
              />
            </div>
          </div>

          <div className="border-t border-[#E8EAED] pt-4 space-y-3">
            <p className="text-xs font-semibold text-[#5C6370]">
              Filter labels ({locale.toUpperCase()})
            </p>
            {filters.map((f, i) => (
              <div
                key={f.id + i}
                className="grid sm:grid-cols-[140px_1fr] gap-3"
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
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#1A2332]">Gallery Images</h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Image titles support English / Thai / Polish.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-4 py-2.5"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[#6B7280]">Loading…</p>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E8EAED] p-10 text-center text-[#6B7280]">
            <Images className="w-8 h-8 mx-auto mb-3 opacity-40" />
            No gallery images yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/products/Kitchen1.png"}
                  alt={localizedValue(item.title, "en")}
                  className="h-40 w-full object-cover bg-[#F3F4F6]"
                />
                <div className="p-4">
                  <p className="font-semibold text-[#1A2332]">
                    {localizedValue(item.title, "en")}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">{item.filter}</p>
                  <div className="flex justify-end gap-1 mt-3">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-lg hover:bg-[#F3F4F6]"
                    >
                      <Pencil className="w-4 h-4" />
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
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-lg bg-white rounded-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-2 gap-3">
              <div>
                <h3 className="font-bold text-lg">
                  {modal === "create" ? "Add Gallery Image" : "Edit Gallery Image"}
                </h3>
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
              label="Image"
              kind="image"
              value={form.image}
              onChange={(v) => setForm({ ...form, image: v })}
            />
            <label className="block text-xs font-semibold text-[#5C6370]">
              Filter
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

            {locale === "en" && (
              <>
                <div className="border-t border-[#E8EAED] pt-3 mt-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#334155] mb-3">
                    Project Metadata & Taxonomy
                  </p>
                </div>

                <label className="block text-xs font-semibold text-[#5C6370]">
                  Project Title
                  <input
                    value={form.projectTitle}
                    onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
                    placeholder="e.g. Modern Villa Kitchen - Phuket"
                    className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                  />
                </label>

                <label className="block text-xs font-semibold text-[#5C6370]">
                  Project Description ({form.projectDesc.length}/300)
                  <textarea
                    rows={3}
                    value={form.projectDesc}
                    onChange={(e) => setForm({ ...form, projectDesc: e.target.value.slice(0, 300) })}
                    placeholder="Brief project description for SEO and discovery (max 300 chars)"
                    maxLength={300}
                    className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal resize-y"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Location Tag
                    <input
                      value={form.locationTag}
                      onChange={(e) => setForm({ ...form, locationTag: e.target.value })}
                      placeholder="e.g. Bangkok, Phuket"
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>

                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Layout Tag
                    <input
                      value={form.layoutTag}
                      onChange={(e) => setForm({ ...form, layoutTag: e.target.value })}
                      placeholder="e.g. L-shaped, U-shaped"
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>

                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Style Tag
                    <input
                      value={form.styleTag}
                      onChange={(e) => setForm({ ...form, styleTag: e.target.value })}
                      placeholder="e.g. Modern, Industrial"
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>

                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Material Tag
                    <input
                      value={form.materialTag}
                      onChange={(e) => setForm({ ...form, materialTag: e.target.value })}
                      placeholder="e.g. Marble, Oak"
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                </div>

                <label className="block text-xs font-semibold text-[#5C6370]">
                  Property Type
                  <input
                    value={form.propertyType}
                    onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                    placeholder="e.g. Villa, Condo, Townhouse"
                    className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                  />
                </label>

                <p className="text-[11px] text-[#6B7280]">
                  These taxonomy tags help with project discovery and SEO. They will be used for filtering and structured data.
                </p>
              </>
            )}

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
      )}
    </>
  );
}
