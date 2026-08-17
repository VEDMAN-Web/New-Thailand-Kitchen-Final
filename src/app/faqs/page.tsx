"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { HelpCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import LocaleTabs from "@/components/LocaleTabs";
import HeroVideoUpload from "@/components/HeroVideoUpload";
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
  createFaq,
  deleteFaq,
  getHome,
  listFaqs,
  updateFaq,
  updateHome,
  type FaqCmsItem,
} from "@/services/adminAPI";
import { CMS_SYNCED_EVENT } from "@/lib/adminSectionNav";

type FaqForm = {
  question: LocalizedText;
  answer: LocalizedText;
  sortOrder: number;
};

type FaqHeroForm = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  videoUrl: string;
};

export default function AdminFaqsPage() {
  const { siteId } = useAdminAuth();
  const [items, setItems] = useState<FaqCmsItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [sections, setSections] = useState<Record<string, unknown>>({});
  const [hero, setHero] = useState<FaqHeroForm>({
    eyebrow: emptyLocalized(),
    title: emptyLocalized(),
    videoUrl: "",
  });
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<FaqCmsItem | null>(null);
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [form, setForm] = useState<FaqForm>({
    question: emptyLocalized(),
    answer: emptyLocalized(),
    sortOrder: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [faqRes, homeRes] = await Promise.all([
        listFaqs(siteId),
        getHome(siteId),
      ]);
      setItems(faqRes.items || []);
      const nextSections = homeRes.home?.sections || {};
      setSections(nextSections);
      const fp = (nextSections.faqPage || {}) as {
        eyebrow?: unknown;
        title?: unknown;
        videoUrl?: string;
      };
      setHero({
        eyebrow: asLocalizedForm(fp.eyebrow),
        title: asLocalizedForm(fp.title),
        videoUrl: String(fp.videoUrl || ""),
      });
    } catch {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => {
      const question = localizedValue(i.question, "en").toLowerCase();
      const answer = localizedValue(i.answer, "en").toLowerCase();
      return question.includes(q) || answer.includes(q);
    });
  }, [items, query]);

  const saveHero = async () => {
    if (!localizedValue(hero.title, "en").trim()) {
      toast.error("English FAQ page title is required");
      return;
    }
    setSavingHero(true);
    try {
      const next = {
        ...sections,
        faqPage: {
          eyebrow: asLocalizedForm(hero.eyebrow),
          title: asLocalizedForm(hero.title),
          videoUrl: hero.videoUrl,
        },
      };
      await updateHome(siteId, next);
      setSections(next);
      toast.success("FAQ page hero saved");
    } catch {
      toast.error("Failed to save FAQ page hero");
    } finally {
      setSavingHero(false);
    }
  };

  const openCreate = () => {
    setForm({
      question: emptyLocalized(),
      answer: emptyLocalized(),
      sortOrder: items.length + 1,
    });
    setEditing(null);
    setLocale("en");
    setModal("create");
  };

  const openEdit = (item: FaqCmsItem) => {
    setEditing(item);
    setForm({
      question: asLocalizedForm(item.question),
      answer: asLocalizedForm(item.answer),
      sortOrder: Number(item.sortOrder) || 0,
    });
    setLocale("en");
    setModal("edit");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!localizedValue(form.question, "en").trim()) {
      toast.error("English question is required");
      return;
    }
    try {
      if (modal === "create") {
        await createFaq(siteId, form);
        toast.success("FAQ created");
      } else if (editing) {
        await updateFaq(siteId, editing._id, form);
        toast.success("FAQ updated");
      }
      setModal(null);
      await load();
    } catch {
      toast.error("Save failed");
    }
  };

  const onDelete = async (item: FaqCmsItem) => {
    const label = localizedValue(item.question, "en").slice(0, 60);
    if (!confirm(`Delete FAQ “${label}”?`)) return;
    try {
      await deleteFaq(siteId, item._id);
      toast.success("Deleted");
      await load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-xl border border-[#E8EAED] bg-white p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#1A2332]">
                FAQ page hero{" "}
                <span className="font-mono text-xs font-normal text-[#6B7280]">
                  /faq
                </span>
              </p>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Video banner + title on the public FAQ page.
              </p>
            </div>
            <button
              type="button"
              onClick={saveHero}
              disabled={savingHero}
              className="rounded-lg bg-[#1A2332] text-white px-3 py-2 text-xs font-semibold disabled:opacity-60"
            >
              {savingHero ? "Saving…" : "Save"}
            </button>
          </div>
          <LocaleTabs locale={locale} onChange={setLocale} />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5C6370] mb-1">
                Eyebrow ({locale.toUpperCase()})
              </label>
              <input
                value={localizedValue(hero.eyebrow, locale)}
                onChange={(e) =>
                  setHero((h) => ({
                    ...h,
                    eyebrow: writeLocalized(h.eyebrow, locale, e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-[#E2E5EA] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5C6370] mb-1">
                Title ({locale.toUpperCase()})
              </label>
              <input
                value={localizedValue(hero.title, locale)}
                onChange={(e) =>
                  setHero((h) => ({
                    ...h,
                    title: writeLocalized(h.title, locale, e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-[#E2E5EA] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <HeroVideoUpload
            value={hero.videoUrl}
            fallbackUrl="/video/faq-autoplay.mp4"
            onChange={(v) => setHero((h) => ({ ...h, videoUrl: v }))}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search FAQs…"
              className="w-full rounded-xl border border-[#E2E5EA] bg-white pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/15"
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1A2332] text-white px-4 py-2.5 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>

        <p className="text-xs text-[#6B7280]">
          Q&amp;A items power <code>/faq</code> and the first 5 also appear on the
          homepage FAQ band.
        </p>

        {loading ? (
          <p className="text-sm text-[#6B7280]">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E2E5EA] bg-white p-12 text-center">
            <HelpCircle className="w-8 h-8 text-[#9CA3AF] mx-auto mb-3" />
            <p className="text-sm text-[#6B7280]">No FAQs yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-[#E8EAED] bg-white p-5 flex gap-4 justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[#1A2332]">
                    {localizedValue(item.question, "en")}
                  </p>
                  <p className="mt-1 text-sm text-[#6B7280] line-clamp-2">
                    {localizedValue(item.answer, "en")}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="p-2 rounded-lg hover:bg-[#F4F5F7]"
                  >
                    <Pencil className="w-4 h-4 text-[#5C6370]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-lg rounded-2xl bg-white p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#1A2332]">
                {modal === "create" ? "Add FAQ" : "Edit FAQ"}
              </h2>
              <button type="button" onClick={() => setModal(null)}>
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>
            <LocaleTabs locale={locale} onChange={setLocale} />
            <div>
              <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                Question ({locale.toUpperCase()})
              </label>
              <input
                value={localizedValue(form.question, locale)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    question: writeLocalized(f.question, locale, e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
                required={locale === "en"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                Answer ({locale.toUpperCase()})
              </label>
              <textarea
                rows={5}
                value={localizedValue(form.answer, locale)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    answer: writeLocalized(f.answer, locale, e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                Sort order
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sortOrder: Number(e.target.value) || 0,
                  }))
                }
                className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
              />
            </div>
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
