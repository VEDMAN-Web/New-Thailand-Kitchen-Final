"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, Save, ScrollText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/AdminShell";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  getLegal,
  updateLegal,
  type LegalSection,
} from "@/services/adminAPI";

type SectionDraft = LegalSection;

export default function AdminTermsPage() {
  const { siteId } = useAdminAuth();
  const [pageTitle, setPageTitle] = useState("TERMS & CONDITIONS");
  const [subtitle, setSubtitle] = useState(
    "TERMS OF USE AND SERVICE AGREEMENT FOR OUR KITCHEN SERVICES."
  );
  const [updatedLabel, setUpdatedLabel] = useState("July 2026");
  const [sections, setSections] = useState<SectionDraft[]>([
    { title: "Acceptance of Terms", body: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLegal(siteId, "terms");
      const page = res.page;
      setPageTitle(page.title || "TERMS & CONDITIONS");
      setSubtitle(
        page.subtitle ||
          "TERMS OF USE AND SERVICE AGREEMENT FOR OUR KITCHEN SERVICES."
      );
      setUpdatedLabel(page.updatedLabel || "July 2026");
      if (page.sections?.length) {
        setSections(
          page.sections.map((s) => ({
            title: s.title || "",
            body: s.body || "",
          }))
        );
      } else {
        setSections([
          { title: "Acceptance of Terms", body: page.content || "" },
        ]);
      }
    } catch {
      toast.error("Failed to load terms & conditions");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    load();
  }, [load]);

  const addSection = () => {
    setSections((prev) => [...prev, { title: "", body: "" }]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSection = (
    index: number,
    key: keyof SectionDraft,
    value: string
  ) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [key]: value } : s))
    );
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pageTitle.trim()) {
      toast.error("Page title is required");
      return;
    }
    const cleanSections = sections
      .map((s) => ({ title: s.title.trim(), body: s.body.trim() }))
      .filter((s) => s.title || s.body);
    if (!cleanSections.length) {
      toast.error("Add at least one section");
      return;
    }

    setSaving(true);
    try {
      await updateLegal(siteId, "terms", {
        title: pageTitle.trim(),
        subtitle: subtitle.trim(),
        updatedLabel: updatedLabel.trim(),
        sections: cleanSections,
      });
      toast.success("Terms & conditions saved");
      await load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Terms & Conditions">
      {loading ? (
        <p className="text-sm text-[#6B7280]">Loading…</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5 max-w-5xl">
          <div className="bg-white rounded-xl border border-[#E8EAED] px-5 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#1A2332] text-white flex items-center justify-center shrink-0">
                <ScrollText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#1A2332]">
                  Terms & Conditions Management
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Manage site terms document sections and metadata
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save Terms & Conditions"}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E8EAED] p-5 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block text-xs font-semibold text-[#5C6370]">
                Page Title
                <input
                  required
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                />
              </label>
              <label className="block text-xs font-semibold text-[#5C6370]">
                Subheading
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                />
              </label>
            </div>
            <label className="block text-xs font-semibold text-[#5C6370]">
              Last Updated Date
              <input
                value={updatedLabel}
                onChange={(e) => setUpdatedLabel(e.target.value)}
                placeholder="July 2026"
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
              />
            </label>

            <div className="pt-2">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#1A2332]">
                    Terms Content Sections
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Add headings and paragraphs for your terms & conditions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSection}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-3.5 py-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Section Block
                </button>
              </div>

              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#E8EAED] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold tracking-wide text-[#334155]">
                        SECTION #{index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] hover:bg-red-50 rounded-lg px-2 py-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Section
                      </button>
                    </div>
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Section Heading
                      <input
                        value={section.title}
                        onChange={(e) =>
                          updateSection(index, "title", e.target.value)
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Section Content
                      <textarea
                        rows={4}
                        value={section.body}
                        onChange={(e) =>
                          updateSection(index, "body", e.target.value)
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
