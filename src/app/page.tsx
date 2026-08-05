"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  CloudUpload,
  Trash2,
  Save,
  Image as ImageIcon,
  BarChart3,
  Sparkles,
  BookOpen,
  Layers,
  MessageSquareQuote,
  FileDown,
  Globe2,
  HelpCircle,
  Contact,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import AdminShell from "@/components/AdminShell";
import MediaUpload from "@/components/MediaUpload";
import HeroVideoUpload from "@/components/HeroVideoUpload";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { getHome, resetHome, updateHome } from "@/services/adminAPI";
import { clsx } from "clsx";

type Sections = Record<string, any>;

const SECTION_META = [
  {
    key: "hero",
    title: "Hero Banner",
    desc: "Main headline & hero CTA",
    icon: ImageIcon,
  },
  {
    key: "statistics",
    title: "Statistics",
    desc: "3 key numerical metrics",
    icon: BarChart3,
  },
  {
    key: "advantages",
    title: "Our Advantages",
    desc: "3 feature cards",
    icon: Sparkles,
  },
  {
    key: "story",
    title: "Our Story",
    desc: "Brand story narrative",
    icon: BookOpen,
  },
  {
    key: "transition",
    title: "Transition Banner",
    desc: "4 pillar process highlights",
    icon: Layers,
  },
  {
    key: "testimonials",
    title: "Testimonials",
    desc: "Customer reviews & ratings",
    icon: MessageSquareQuote,
  },
  {
    key: "catalogue",
    title: "Free Catalogue",
    desc: "Downloadable PDF catalogs",
    icon: FileDown,
  },
  {
    key: "partners",
    title: "Global Partners",
    desc: "Brand partner logos",
    icon: Globe2,
  },
  {
    key: "faq",
    title: "FAQ Section",
    desc: "Frequently asked questions",
    icon: HelpCircle,
  },
  {
    key: "footer",
    title: "Footer & Contact",
    desc: "Address, email & social links",
    icon: Contact,
  },
] as const;

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-[#E2E5EA] bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/15 focus:border-[#1A2332]";
  return (
    <div>
      <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls + " resize-y"}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </div>
  );
}

function isSectionComplete(key: string, sections: Sections): boolean {
  const s = sections?.[key];
  if (!s) return false;
  switch (key) {
    case "hero":
      return Boolean(s.title && (s.subtitle || s.description) && (s.buttonText || s.cta));
    case "statistics":
      return Array.isArray(s.items) && s.items.length >= 1;
    case "advantages":
      return Array.isArray(s.items) && s.items.length >= 1;
    case "story":
      return Boolean(s.title && (s.description || s.text));
    case "transition":
      return (
        (Array.isArray(s.pillars) && s.pillars.length >= 1) ||
        (Array.isArray(s.items) && s.items.length >= 1)
      );
    case "testimonials":
      return Array.isArray(s.items) && s.items.length >= 1;
    case "catalogue":
      return Array.isArray(s.items) && s.items.length >= 1;
    case "partners":
      return (
        (Array.isArray(s.logos) && s.logos.length >= 1) ||
        (Array.isArray(s.items) && s.items.length >= 1)
      );
    case "faq":
      return Array.isArray(s.items) && s.items.length >= 1;
    case "footer":
      return Boolean(s.email || s.address || s.phone);
    default:
      return true;
  }
}

export default function AdminHomePage() {
  const { siteId } = useAdminAuth();
  const [sections, setSections] = useState<Sections>({});
  const [active, setActive] = useState<string>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHome(siteId);
      setSections(res.home.sections || {});
    } catch {
      toast.error("Failed to load home content");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    load();
  }, [load]);

  const doneCount = useMemo(
    () => SECTION_META.filter((m) => isSectionComplete(m.key, sections)).length,
    [sections]
  );

  const patch = (key: string, value: unknown) => {
    setSections((prev) => ({ ...prev, [key]: value }));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await updateHome(siteId, sections);
      toast.success("Home page updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onResetPage = async () => {
    if (!confirm("Reset entire home page to defaults?")) return;
    setSaving(true);
    try {
      const res = await resetHome(siteId);
      setSections(res.home.sections);
      toast.success("Home page reset");
    } catch {
      toast.error("Reset failed");
    } finally {
      setSaving(false);
    }
  };

  const activeMeta = SECTION_META.find((m) => m.key === active)!;
  const complete = isSectionComplete(active, sections);

  return (
    <AdminShell title="Home Management">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-[0.1em] uppercase text-[#5C6370]">
              Home Management
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] text-[#166534] text-xs font-semibold px-2.5 py-1">
              <Check className="w-3.5 h-3.5" />
              {doneCount} of {SECTION_META.length} Sections Ready
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveAll}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[#243044] disabled:opacity-60"
            >
              <CloudUpload className="w-4 h-4" />
              Update Home Page
            </button>
            <button
              type="button"
              onClick={onResetPage}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-[#FECACA] bg-white text-[#DC2626] text-sm font-semibold px-4 py-2.5 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Reset Page
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-[#6B7280]">Loading sections…</p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-5 items-start">
            <div className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8EAED] flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#5C6370]">
                  Website Sections
                </span>
                <span className="text-xs font-semibold text-[#16A34A]">
                  {doneCount}/{SECTION_META.length} Done
                </span>
              </div>
              <ul className="divide-y divide-[#F0F1F3]">
                {SECTION_META.map(({ key, title, desc, icon: Icon }) => {
                  const selected = active === key;
                  const ok = isSectionComplete(key, sections);
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => setActive(key)}
                        className={clsx(
                          "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors",
                          selected
                            ? "bg-[#F3F4F6] border-l-[3px] border-l-[#1A2332]"
                            : "border-l-[3px] border-l-transparent hover:bg-[#F9FAFB]"
                        )}
                      >
                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#EEF0F3] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-[#1A2332]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#1A2332]">{title}</p>
                          <p className="text-xs text-[#6B7280] mt-0.5 truncate">{desc}</p>
                        </div>
                        {ok && (
                          <span className="mt-1 w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-[#E8EAED] p-5 lg:p-6">
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1A2332]">{activeMeta.title}</h2>
                  <p className="text-sm text-[#6B7280] mt-0.5">{activeMeta.desc}</p>
                </div>
                {complete && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] text-[#166534] text-xs font-semibold px-2.5 py-1">
                    <Check className="w-3.5 h-3.5" />
                    Complete
                  </span>
                )}
              </div>

              <SectionEditor
                sectionKey={active}
                data={sections[active] || {}}
                onChange={(next) => patch(active, next)}
              />

              <div className="mt-8 flex items-center gap-2 pt-5 border-t border-[#E8EAED]">
                <button
                  type="button"
                  onClick={saveAll}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[#243044]"
                >
                  <Save className="w-4 h-4" />
                  Save Section
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Reload this page from server (discard unsaved)?")) return;
                    await load();
                    toast.message("Reloaded from server");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#DC2626] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[#B91C1C]"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset Section
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function AddItemButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#1A2332] hover:bg-[#F8FAFC]"
    >
      <Plus className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function SectionEditor({
  sectionKey,
  data,
  onChange,
}: {
  sectionKey: string;
  data: any;
  onChange: (next: any) => void;
}) {
  if (sectionKey === "hero") {
    return (
      <div className="space-y-4">
        <Field
          label="Subtitle"
          value={data.subtitle || ""}
          onChange={(v) => onChange({ ...data, subtitle: v })}
        />
        <Field
          label="Title"
          value={data.title || ""}
          onChange={(v) => onChange({ ...data, title: v })}
        />
        <Field
          label="Description"
          multiline
          value={data.description || ""}
          onChange={(v) => onChange({ ...data, description: v })}
        />
        <Field
          label="Button Text"
          value={data.buttonText || ""}
          onChange={(v) => onChange({ ...data, buttonText: v })}
        />
        <MediaUpload
          label="Hero Image"
          kind="image"
          value={data.image || ""}
          onChange={(v) => onChange({ ...data, image: v })}
        />
        <HeroVideoUpload
          value={data.videoUrl || ""}
          onChange={(v) => onChange({ ...data, videoUrl: v })}
        />
      </div>
    );
  }

  if (sectionKey === "statistics") {
    const items = data.items || [];
    return (
      <div className="space-y-4">
        {items.map((item: any, i: number) => (
          <div
            key={i}
            className="rounded-xl border border-[#E8EAED] p-4 grid sm:grid-cols-3 gap-3"
          >
            <Field
              label={`Stat #${i + 1} Label`}
              value={item.label || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, label: v };
                onChange({ ...data, items: next });
              }}
            />
            <Field
              label="Value"
              value={item.value || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, value: v };
                onChange({ ...data, items: next });
              }}
            />
            <div className="space-y-2">
              <Field
                label="Suffix"
                value={item.suffix || ""}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...item, suffix: v };
                  onChange({ ...data, items: next });
                }}
              />
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() =>
                  onChange({
                    ...data,
                    items: items.filter((_: any, idx: number) => idx !== i),
                  })
                }
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <AddItemButton
          label="Add statistic"
          onClick={() =>
            onChange({
              ...data,
              items: [...items, { label: "", value: "", suffix: "" }],
            })
          }
        />
      </div>
    );
  }

  if (sectionKey === "advantages") {
    const items = data.items || [];
    return (
      <div className="space-y-4">
        {items.map((item: any, i: number) => (
          <div key={i} className="rounded-xl border border-[#E8EAED] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#1A2332] text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-[#5C6370]">
                  Advantage #{i + 1}
                </span>
              </div>
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() =>
                  onChange({
                    ...data,
                    items: items.filter((_: any, idx: number) => idx !== i),
                  })
                }
              >
                Remove
              </button>
            </div>
            <Field
              label="Title"
              value={item.title || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, title: v };
                onChange({ ...data, items: next });
              }}
            />
            <Field
              label="Description"
              multiline
              value={item.description || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, description: v };
                onChange({ ...data, items: next });
              }}
            />
            <MediaUpload
              label="Icon"
              kind="icon"
              value={item.icon || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, icon: v };
                onChange({ ...data, items: next });
              }}
            />
          </div>
        ))}
        <AddItemButton
          label="Add advantage"
          onClick={() =>
            onChange({
              ...data,
              items: [...items, { title: "", description: "", icon: "" }],
            })
          }
        />
      </div>
    );
  }

  if (sectionKey === "story") {
    return (
      <div className="space-y-4">
        <Field
          label="Title"
          value={data.title || ""}
          onChange={(v) => onChange({ ...data, title: v })}
        />
        <Field
          label="Subtitle"
          value={data.subtitle || ""}
          onChange={(v) => onChange({ ...data, subtitle: v })}
        />
        <Field
          label="Description"
          multiline
          value={data.description || ""}
          onChange={(v) => onChange({ ...data, description: v })}
        />
        <MediaUpload
          label="Story Image"
          kind="image"
          value={data.image || ""}
          onChange={(v) => onChange({ ...data, image: v })}
        />
      </div>
    );
  }

  if (sectionKey === "transition") {
    const pillars = data.pillars || [];
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {pillars.map((item: any, i: number) => (
            <div key={i} className="rounded-xl border border-[#E8EAED] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#1A2332] text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-[#5C6370]">
                    Pillar #{i + 1}
                  </span>
                </div>
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() =>
                    onChange({
                      ...data,
                      pillars: pillars.filter((_: any, idx: number) => idx !== i),
                    })
                  }
                >
                  Remove
                </button>
              </div>
              <Field
                label="Pillar Title"
                value={item.title || ""}
                onChange={(v) => {
                  const next = [...pillars];
                  next[i] = { ...item, title: v };
                  onChange({ ...data, pillars: next });
                }}
              />
              <Field
                label="Pillar Description"
                multiline
                value={item.description || ""}
                onChange={(v) => {
                  const next = [...pillars];
                  next[i] = { ...item, description: v };
                  onChange({ ...data, pillars: next });
                }}
              />
              <MediaUpload
                label="Icon"
                kind="icon"
                value={item.icon || ""}
                onChange={(v) => {
                  const next = [...pillars];
                  next[i] = { ...item, icon: v };
                  onChange({ ...data, pillars: next });
                }}
              />
            </div>
          ))}
        </div>
        <AddItemButton
          label="Add pillar"
          onClick={() =>
            onChange({
              ...data,
              pillars: [...pillars, { title: "", description: "", icon: "" }],
            })
          }
        />
      </div>
    );
  }

  if (sectionKey === "testimonials") {
    const items = data.items || [];
    return (
      <div className="space-y-4">
        {items.map((item: any, i: number) => (
          <div key={i} className="rounded-xl border border-[#E8EAED] p-4 space-y-3">
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() =>
                  onChange({
                    ...data,
                    items: items.filter((_: any, idx: number) => idx !== i),
                  })
                }
              >
                Remove
              </button>
            </div>
            <Field
              label="Name"
              value={item.name || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, name: v };
                onChange({ ...data, items: next });
              }}
            />
            <Field
              label="Role"
              value={item.role || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, role: v };
                onChange({ ...data, items: next });
              }}
            />
            <Field
              label="Quote"
              multiline
              value={item.quote || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, quote: v };
                onChange({ ...data, items: next });
              }}
            />
            <MediaUpload
              label="Photo"
              kind="image"
              value={item.image || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, image: v };
                onChange({ ...data, items: next });
              }}
            />
            <Field
              label="Rating (1-5)"
              value={String(item.rating ?? 5)}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, rating: Number(v) || 5 };
                onChange({ ...data, items: next });
              }}
            />
          </div>
        ))}
        <AddItemButton
          label="Add testimonial"
          onClick={() =>
            onChange({
              ...data,
              items: [
                ...items,
                { name: "", role: "", quote: "", image: "", rating: 5 },
              ],
            })
          }
        />
      </div>
    );
  }

  if (sectionKey === "catalogue") {
    const items = data.items || [];
    return (
      <div className="space-y-4">
        {items.map((item: any, i: number) => (
          <div key={i} className="rounded-xl border border-[#E8EAED] p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-bold uppercase text-[#5C6370]">
                Catalogue #{i + 1}
              </span>
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() =>
                  onChange({
                    ...data,
                    items: items.filter((_: any, idx: number) => idx !== i),
                  })
                }
              >
                Remove
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field
                label="Title"
                value={item.title || ""}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...item, title: v };
                  onChange({ ...data, items: next });
                }}
              />
              <Field
                label="Category"
                value={item.category || ""}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...item, category: v };
                  onChange({ ...data, items: next });
                }}
              />
            </div>
            <MediaUpload
              label="Cover Image"
              kind="image"
              value={item.image || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, image: v };
                onChange({ ...data, items: next });
              }}
            />
            <MediaUpload
              label="PDF File"
              kind="pdf"
              value={item.pdfUrl || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, pdfUrl: v };
                onChange({ ...data, items: next });
              }}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field
                label="Legacy file name (optional)"
                value={item.fileName || ""}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...item, fileName: v };
                  onChange({ ...data, items: next });
                }}
              />
              <Field
                label="Download name"
                value={item.downloadName || ""}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...item, downloadName: v };
                  onChange({ ...data, items: next });
                }}
              />
            </div>
          </div>
        ))}
        <AddItemButton
          label="Add catalogue"
          onClick={() =>
            onChange({
              ...data,
              items: [
                ...items,
                {
                  title: "",
                  category: "",
                  image: "",
                  pdfUrl: "",
                  fileName: "",
                  downloadName: "",
                },
              ],
            })
          }
        />
      </div>
    );
  }

  if (sectionKey === "partners") {
    const logos = data.logos || [];
    return (
      <div className="space-y-4">
        {logos.map((item: any, i: number) => (
          <div key={i} className="rounded-xl border border-[#E8EAED] p-4 space-y-3">
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() =>
                  onChange({
                    ...data,
                    logos: logos.filter((_: any, idx: number) => idx !== i),
                  })
                }
              >
                Remove
              </button>
            </div>
            <Field
              label={`Partner #${i + 1} Name`}
              value={item.name || ""}
              onChange={(v) => {
                const next = [...logos];
                next[i] = { ...item, name: v };
                onChange({ ...data, logos: next });
              }}
            />
            <MediaUpload
              label="Logo"
              kind="image"
              value={item.image || ""}
              onChange={(v) => {
                const next = [...logos];
                next[i] = { ...item, image: v };
                onChange({ ...data, logos: next });
              }}
            />
          </div>
        ))}
        <AddItemButton
          label="Add partner"
          onClick={() =>
            onChange({
              ...data,
              logos: [...logos, { name: "", image: "" }],
            })
          }
        />
      </div>
    );
  }

  if (sectionKey === "faq") {
    const items = data.items || [];
    return (
      <div className="space-y-4">
        {items.map((item: any, i: number) => (
          <div key={i} className="rounded-xl border border-[#E8EAED] p-4 space-y-3">
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() =>
                  onChange({
                    ...data,
                    items: items.filter((_: any, idx: number) => idx !== i),
                  })
                }
              >
                Remove
              </button>
            </div>
            <Field
              label={`Question #${i + 1}`}
              value={item.question || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, question: v };
                onChange({ ...data, items: next });
              }}
            />
            <Field
              label="Answer"
              multiline
              value={item.answer || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, answer: v };
                onChange({ ...data, items: next });
              }}
            />
          </div>
        ))}
        <AddItemButton
          label="Add FAQ"
          onClick={() =>
            onChange({
              ...data,
              items: [...items, { question: "", answer: "" }],
            })
          }
        />
      </div>
    );
  }

  if (sectionKey === "footer") {
    return (
      <div className="space-y-4">
        <Field
          label="Address"
          value={data.address || ""}
          onChange={(v) => onChange({ ...data, address: v })}
        />
        <Field
          label="Email"
          value={data.email || ""}
          onChange={(v) => onChange({ ...data, email: v })}
        />
        <Field
          label="Phone"
          value={data.phone || ""}
          onChange={(v) => onChange({ ...data, phone: v })}
        />
        <div className="grid sm:grid-cols-3 gap-3">
          <Field
            label="Facebook"
            value={data.facebook || ""}
            onChange={(v) => onChange({ ...data, facebook: v })}
          />
          <Field
            label="Instagram"
            value={data.instagram || ""}
            onChange={(v) => onChange({ ...data, instagram: v })}
          />
          <Field
            label="LINE"
            value={data.line || ""}
            onChange={(v) => onChange({ ...data, line: v })}
          />
        </div>
      </div>
    );
  }

  return <p className="text-sm text-[#6B7280]">Unknown section</p>;
}
