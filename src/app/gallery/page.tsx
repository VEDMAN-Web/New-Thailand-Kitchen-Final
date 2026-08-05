"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Images, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/AdminShell";
import MediaUpload from "@/components/MediaUpload";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  createGalleryItem,
  deleteGalleryItem,
  getHome,
  listGallery,
  updateGalleryItem,
  updateHome,
  type GalleryCmsItem,
} from "@/services/adminAPI";

const FILTERS = [
  "Layout & Space",
  "Storage",
  "Style & Color",
  "Materials",
] as const;

const empty = {
  title: "",
  image: "",
  filter: "Style & Color",
  tall: false,
  wide: false,
};

const emptyHero = {
  eyebrow: "",
  title: "",
  description: "",
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
  const [hero, setHero] = useState(emptyHero);
  const [sections, setSections] = useState<Record<string, unknown>>({});
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<GalleryCmsItem | null>(null);
  const [form, setForm] = useState(empty);

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
        eyebrow?: string;
        title?: string;
        description?: string;
        collage?: string[];
      };
      const collage = gp.collage || [];
      setHero({
        eyebrow: gp.eyebrow || "",
        title: gp.title || "",
        description: gp.description || "",
        collage1: collage[0] || "",
        collage2: collage[1] || "",
        collage3: collage[2] || "",
        collage4: collage[3] || "",
      });
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
    if (!hero.title.trim()) {
      toast.error("Gallery heading is required");
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
          eyebrow: hero.eyebrow.trim(),
          title: hero.title.trim(),
          description: hero.description.trim(),
          collage,
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
    setForm(empty);
    setEditing(null);
    setModal("create");
  };

  const openEdit = (item: GalleryCmsItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      image: item.image,
      filter: item.filter || "Style & Color",
      tall: Boolean(item.tall),
      wide: Boolean(item.wide),
    });
    setModal("edit");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.image) {
      toast.error("Please upload an image");
      return;
    }
    try {
      if (modal === "create") {
        await createGalleryItem(siteId, form);
        toast.success("Gallery item created");
      } else if (editing) {
        await updateGalleryItem(siteId, editing._id, form);
        toast.success("Gallery item updated");
      }
      setModal(null);
      await load();
    } catch {
      toast.error("Save failed");
    }
  };

  const onDelete = async (item: GalleryCmsItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await deleteGalleryItem(siteId, item._id);
      toast.success("Deleted");
      await load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <AdminShell title="Gallery Management">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-[#E8EAED] p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#1A2332]">
                Gallery Page Content
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Heading, paragraph and hero collage shown on the website gallery
                page.
              </p>
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
              Eyebrow / Small heading
              <input
                value={hero.eyebrow}
                onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
                placeholder="e.g. The Gallery · Vol. 04"
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-semibold text-[#5C6370]">
              Main heading *
              <input
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                placeholder="Gallery page title"
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-[#5C6370]">
            Paragraph / Description
            <textarea
              rows={4}
              value={hero.description}
              onChange={(e) => setHero({ ...hero, description: e.target.value })}
              placeholder="Gallery intro paragraph"
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
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#1A2332]">Gallery Images</h2>
            <p className="text-xs text-[#6B7280] mt-1">
              These images appear in the website gallery grid.
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
            No gallery images yet. Upload from admin to show on the website.
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
                  alt={item.title}
                  className="h-40 w-full object-cover bg-[#F3F4F6]"
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (el.dataset.fallback === "1") return;
                    el.dataset.fallback = "1";
                    el.src = "/products/Kitchen1.png";
                  }}
                />
                <div className="p-4">
                  <p className="font-semibold text-[#1A2332]">{item.title}</p>
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
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">
                {modal === "create" ? "Add Gallery Image" : "Edit Gallery Image"}
              </h3>
              <button type="button" onClick={() => setModal(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <label className="block text-xs font-semibold text-[#5C6370]">
              Title
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-semibold text-[#5C6370]">
              Filter
              <select
                value={form.filter}
                onChange={(e) => setForm({ ...form, filter: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
              >
                {FILTERS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <MediaUpload
              label="Image"
              kind="image"
              value={form.image}
              onChange={(v) => setForm({ ...form, image: v })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.tall}
                onChange={(e) => setForm({ ...form, tall: e.target.checked })}
              />
              Tall layout
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.wide}
                onChange={(e) => setForm({ ...form, wide: e.target.checked })}
              />
              Wide layout
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border px-4 py-2 text-sm"
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
    </AdminShell>
  );
}
