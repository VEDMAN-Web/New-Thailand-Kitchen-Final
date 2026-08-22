"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import LocaleTabs from "@/components/LocaleTabs";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  asLocalizedForm,
  emptyLocalized,
  localizedValue,
  writeLocalized,
  type LocaleCode,
  type LocalizedText,
} from "@/lib/localized";
import { getLegal, updateLegal } from "@/services/adminAPI";

type SectionDraft = { title: LocalizedText; body: LocalizedText };

export default function LegalEditor({
  type,
  defaultTitle,
  defaultSubtitle,
}: {
  type: "privacy" | "terms";
  defaultTitle: string;
  defaultSubtitle: string;
}) {
  const { siteId } = useAdminAuth();
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [pageTitle, setPageTitle] = useState<LocalizedText>(
    asLocalizedForm(defaultTitle)
  );
  const [subtitle, setSubtitle] = useState<LocalizedText>(
    asLocalizedForm(defaultSubtitle)
  );
  const [updatedLabel, setUpdatedLabel] = useState<LocalizedText>(
    asLocalizedForm("July 2026")
  );
  const [sections, setSections] = useState<SectionDraft[]>([
    { title: emptyLocalized(), body: emptyLocalized() },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const loadSeqRef = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    setLoading(true);
    try {
      const res = await getLegal(siteId, type);
      if (seq !== loadSeqRef.current) return;
      const page = res.page;
      setPageTitle(asLocalizedForm(page.title, defaultTitle));
      setSubtitle(asLocalizedForm(page.subtitle, defaultSubtitle));
      setUpdatedLabel(asLocalizedForm(page.updatedLabel, "July 2026"));
      if (page.sections?.length) {
        setSections(
          page.sections.map((s) => ({
            title: asLocalizedForm(s.title),
            body: asLocalizedForm(s.body),
          }))
        );
      } else {
        setSections([
          {
            title: asLocalizedForm("Section"),
            body: asLocalizedForm(page.content || ""),
          },
        ]);
      }
    } catch {
      if (seq !== loadSeqRef.current) return;
      toast.error(`Failed to load ${type}`);
    } finally {
      if (seq === loadSeqRef.current) setLoading(false);
    }
  }, [siteId, type, defaultTitle, defaultSubtitle]);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!localizedValue(pageTitle, "en").trim()) {
      toast.error("English page title is required");
      return;
    }
    const cleanSections = sections
      .map((s) => ({
        title: asLocalizedForm(s.title),
        body: asLocalizedForm(s.body),
      }))
      .filter(
        (s) =>
          localizedValue(s.title, "en").trim() ||
          localizedValue(s.body, "en").trim()
      );
    if (!cleanSections.length) {
      toast.error("Add at least one section");
      return;
    }

    setSaving(true);
    try {
      await updateLegal(siteId, type, {
        title: asLocalizedForm(pageTitle),
        subtitle: asLocalizedForm(subtitle),
        updatedLabel: asLocalizedForm(updatedLabel),
        sections: cleanSections,
      });
      toast.success("Saved");
      await load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-[#6B7280]">Loading…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LocaleTabs locale={locale} onChange={setLocale} />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      <p className="text-xs text-[#94A3B8]">
        Switch language to edit Thai or Polish legal copy.
      </p>

      <div>
        <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
          Page title ({locale.toUpperCase()})
        </label>
        <input
          value={localizedValue(pageTitle, locale)}
          onChange={(e) =>
            setPageTitle(writeLocalized(pageTitle, locale, e.target.value))
          }
          className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
          required={locale === "en"}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
          Subtitle ({locale.toUpperCase()})
        </label>
        <input
          value={localizedValue(subtitle, locale)}
          onChange={(e) =>
            setSubtitle(writeLocalized(subtitle, locale, e.target.value))
          }
          className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
          Updated label ({locale.toUpperCase()})
        </label>
        <input
          value={localizedValue(updatedLabel, locale)}
          onChange={(e) =>
            setUpdatedLabel(
              writeLocalized(updatedLabel, locale, e.target.value)
            )
          }
          className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
            Sections
          </p>
          <button
            type="button"
            onClick={() =>
              setSections((prev) => [
                ...prev,
                { title: emptyLocalized(), body: emptyLocalized() },
              ])
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#CBD5E1] px-3 py-2 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            Add section
          </button>
        </div>
        {sections.map((section, index) => (
          <div
            key={index}
            className="rounded-xl border border-[#E8EAED] p-4 space-y-3"
          >
            <div className="flex justify-between gap-2">
              <label className="block flex-1 text-xs font-semibold text-[#5C6370]">
                Section title ({locale.toUpperCase()})
                <input
                  value={localizedValue(section.title, locale)}
                  onChange={(e) =>
                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === index
                          ? {
                              ...s,
                              title: writeLocalized(
                                s.title,
                                locale,
                                e.target.value
                              ),
                            }
                          : s
                      )
                    )
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  setSections((prev) => prev.filter((_, i) => i !== index))
                }
                className="mt-6 p-2 rounded-lg hover:bg-red-50 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <label className="block text-xs font-semibold text-[#5C6370]">
              Body ({locale.toUpperCase()})
              <textarea
                rows={4}
                value={localizedValue(section.body, locale)}
                onChange={(e) =>
                  setSections((prev) =>
                    prev.map((s, i) =>
                      i === index
                        ? {
                            ...s,
                            body: writeLocalized(
                              s.body,
                              locale,
                              e.target.value
                            ),
                          }
                        : s
                    )
                  )
                }
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal resize-y"
              />
            </label>
          </div>
        ))}
      </div>
    </form>
  );
}
