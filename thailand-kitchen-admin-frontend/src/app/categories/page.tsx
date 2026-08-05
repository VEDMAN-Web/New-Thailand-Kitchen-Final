"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FolderOpen, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/AdminShell";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type CategoryItem,
} from "@/services/adminAPI";
import MediaUpload from "@/components/MediaUpload";

export default function AdminCategoriesPage() {
  const { siteId } = useAdminAuth();
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [form, setForm] = useState({ title: "", description: "", image: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCategories(siteId);
      setItems(res.items || []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
    );
  }, [items, query]);

  const openCreate = () => {
    setForm({ title: "", description: "", image: "/products/Kitchen2.png" });
    setEditing(null);
    setModal("create");
  };

  const openEdit = (item: CategoryItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      image: item.image,
    });
    setModal("edit");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (modal === "create") {
        await createCategory(siteId, form);
        toast.success("Category created");
      } else if (editing) {
        await updateCategory(siteId, editing._id, form);
        toast.success("Category updated");
      }
      setModal(null);
      await load();
    } catch {
      toast.error("Save failed");
    }
  };

  const onDelete = async (item: CategoryItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await deleteCategory(siteId, item._id);
      toast.success("Deleted");
      await load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <AdminShell title="Category Management">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search category folders..."
            className="w-full rounded-full border border-[#E2E5EA] bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/15"
          />
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[#243044]"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#6B7280]">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-[#D1D5DB] p-12 text-center text-sm text-[#6B7280]">
          No categories yet. Add your first category folder.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <article
              key={item._id}
              className="group bg-white rounded-xl border border-[#E8EAED] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[16/10] bg-[#EEF0F3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/products/Kitchen2.png"}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-[#1A2332]/90 text-white text-[10px] font-bold tracking-wide px-2 py-1">
                  <FolderOpen className="w-3 h-3" />
                  CATEGORY
                </span>
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center text-[#1A2332] shadow"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center text-[#DC2626] shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#1A2332]">{item.title}</h3>
                <p className="mt-1.5 text-sm text-[#6B7280] line-clamp-2">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-lg bg-white rounded-2xl border border-[#E8EAED] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {modal === "create" ? "Add Category" : "Edit Category"}
              </h3>
              <button type="button" onClick={() => setModal(null)}>
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>
            <label className="block text-xs font-semibold text-[#5C6370] mb-1">
              Title
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold text-[#5C6370] mb-1">
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm"
              />
            </label>
            <MediaUpload
              label="Image"
              kind="image"
              value={form.image}
              onChange={(v) => setForm({ ...form, image: v })}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-[#E2E5EA] px-4 py-2 text-sm font-medium"
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
