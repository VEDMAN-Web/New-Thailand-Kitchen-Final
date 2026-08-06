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
  Package,
  Newspaper,
  MessageCircleQuestion,
  MapPin,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import MediaUpload from "@/components/MediaUpload";
import HeroVideoUpload from "@/components/HeroVideoUpload";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { getHome, resetHome, updateHome } from "@/services/adminAPI";
import { clsx } from "clsx";
import LocaleTabs from "@/components/LocaleTabs";
import {
  localizedValue,
  writeLocalized,
  type LocaleCode,
  type LocalizedText,
} from "@/lib/localized";
import {
  ADMIN_SECTION_EVENT,
  readAdminSectionFromUrl,
  writeAdminSectionToUrl,
} from "@/lib/adminSectionNav";

type Sections = Record<string, any>;

type SectionGroup = "chrome" | "home" | "pages";

const SECTION_META = [
  // —— Site-wide (navbar lives on every page) ——
  {
    key: "siteChrome",
    title: "Navbar & SEO",
    desc: "Top nav links, consultation CTA & SEO meta",
    icon: Settings,
    group: "chrome" as SectionGroup,
  },
  // —— Homepage scroll order (top → bottom) ——
  {
    key: "hero",
    title: "01 · Hero Banner",
    desc: "Homepage hero video, headline & CTA",
    icon: ImageIcon,
    group: "home" as SectionGroup,
  },
  {
    key: "partners",
    title: "02 · Brand Partners",
    desc: "Logo marquee under the hero",
    icon: Globe2,
    group: "home" as SectionGroup,
  },
  {
    key: "story",
    title: "03 · Our Story",
    desc: "About / crafted with passion block",
    icon: BookOpen,
    group: "home" as SectionGroup,
  },
  {
    key: "transition",
    title: "04 · Craft Pillars",
    desc: "Four process highlights under Our Story",
    icon: Layers,
    group: "home" as SectionGroup,
  },
  {
    key: "productsPage",
    title: "05 · Products Band",
    desc: "Home “Our Products” heading + Products page hero",
    icon: Package,
    group: "home" as SectionGroup,
  },
  {
    key: "testimonials",
    title: "06 · Testimonials",
    desc: "Customer reviews section",
    icon: MessageSquareQuote,
    group: "home" as SectionGroup,
  },
  {
    key: "statistics",
    title: "07 · Statistics",
    desc: "Key numerical metrics strip",
    icon: BarChart3,
    group: "home" as SectionGroup,
  },
  {
    key: "advantages",
    title: "08 · Premium Features",
    desc: "Why Choose Us feature cards",
    icon: Sparkles,
    group: "home" as SectionGroup,
  },
  {
    key: "catalogue",
    title: "09 · Free Catalogue",
    desc: "Catalogue section + /catalogue page PDFs",
    icon: FileDown,
    group: "home" as SectionGroup,
  },
  {
    key: "faq",
    title: "10 · Home FAQ",
    desc: "First 5 FAQs above Get in Touch",
    icon: HelpCircle,
    group: "home" as SectionGroup,
  },
  {
    key: "footer",
    title: "11 · Footer",
    desc: "Logo, link columns, contact & social",
    icon: Contact,
    group: "home" as SectionGroup,
  },
  // —— Other website pages (same order as main nav: Blog → Contact → FAQ) ——
  {
    key: "blogPage",
    title: "Blog Page",
    desc: "Blog hero, share links & related heading",
    icon: Newspaper,
    group: "pages" as SectionGroup,
  },
  {
    key: "contactPage",
    title: "Contact Page",
    desc: "Contact hero, locations & craft image",
    icon: MapPin,
    group: "pages" as SectionGroup,
  },
  {
    key: "faqPage",
    title: "FAQ Page",
    desc: "FAQ page hero video & titles",
    icon: MessageCircleQuestion,
    group: "pages" as SectionGroup,
  },
] as const;

const SECTION_GROUPS: { id: SectionGroup; label: string }[] = [
  { id: "chrome", label: "Site-wide" },
  { id: "home", label: "Homepage (top → bottom)" },
  { id: "pages", label: "Other pages" },
];

const SECTION_KEYS = SECTION_META.map((m) => m.key) as readonly string[];

function isSectionKey(value: string | null | undefined): value is string {
  return Boolean(value && SECTION_KEYS.includes(value));
}

function Field({
  label,
  value,
  onChange,
  multiline,
  locale,
  shared,
}: {
  label: string;
  value: string | LocalizedText;
  onChange: (v: any) => void;
  multiline?: boolean;
  locale?: LocaleCode;
  shared?: boolean;
}) {
  const useLocale = Boolean(locale) && !shared;
  const display = useLocale
    ? localizedValue(value, locale!)
    : typeof value === "string"
      ? value
      : localizedValue(value, "en");
  const handle = (raw: string) => {
    if (useLocale) onChange(writeLocalized(value, locale!, raw));
    else onChange(raw);
  };
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
          value={display}
          onChange={(e) => handle(e.target.value)}
          className={cls + " resize-y"}
        />
      ) : (
        <input
          type="text"
          value={display}
          onChange={(e) => handle(e.target.value)}
          className={cls}
        />
      )}
    </div>
  );
}

function isSectionComplete(key: string, sections: Sections): boolean {
  if (key === "siteChrome") {
    const nav = sections?.nav;
    const seo = sections?.seo;
    return Boolean(
      (nav?.links?.length || localizedValue(nav?.consultationLabel, "en")) &&
        (localizedValue(seo?.title, "en") ||
          localizedValue(seo?.description, "en"))
    );
  }
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
      return Boolean(s.email || s.address || s.phone || s.logoUrl);
    case "productsPage":
      return Boolean(localizedValue(s.title, "en") || s.videoUrl || localizedValue(s.label, "en") || localizedValue(s.homeTitle, "en"));
    case "blogPage":
      return Boolean(localizedValue(s.title, "en") || s.videoUrl || localizedValue(s.eyebrow, "en"));
    case "faqPage":
      return Boolean(localizedValue(s.title, "en") || s.videoUrl || localizedValue(s.eyebrow, "en"));
    case "contactPage":
      return Boolean(localizedValue(s.title, "en") || s.email || s.phone || s.videoUrl);
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
  const [locale, setLocale] = useState<LocaleCode>("en");

  // Read deep-link once on mount + listen for sidebar section picks (no Next navigation).
  useEffect(() => {
    const fromUrl = readAdminSectionFromUrl();
    if (isSectionKey(fromUrl)) setActive(fromUrl);

    const onSection = (event: Event) => {
      const key = (event as CustomEvent<string>).detail;
      if (isSectionKey(key)) setActive(key);
    };
    window.addEventListener(ADMIN_SECTION_EVENT, onSection);
    return () => window.removeEventListener(ADMIN_SECTION_EVENT, onSection);
  }, []);

  const selectSection = (key: string) => {
    if (key === active) return;
    setActive(key);
    writeAdminSectionToUrl(key);
  };

  const load = useCallback(async () => {
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
    setLoading(true);
    void load();
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

  const activeMeta = SECTION_META.find((m) => m.key === active) || SECTION_META[1];
  const complete = isSectionComplete(active, sections);
  const showInitialLoader = loading && Object.keys(sections).length === 0;

  return (
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

        {showInitialLoader ? (
          <p className="text-sm text-[#6B7280]">Loading sections…</p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-5 items-start">
            <div className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8EAED] flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#5C6370]">
                  Same order as website
                </span>
                <span className="text-xs font-semibold text-[#16A34A]">
                  {doneCount}/{SECTION_META.length} Done
                </span>
              </div>
              <ul className="divide-y divide-[#F0F1F3]">
                {SECTION_GROUPS.map((group) => {
                  const items = SECTION_META.filter((m) => m.group === group.id);
                  if (!items.length) return null;
                  return (
                    <li key={group.id} className="list-none">
                      <div className="px-4 py-2 bg-[#F8F9FB] border-b border-[#F0F1F3]">
                        <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#9CA3AF]">
                          {group.label}
                        </p>
                      </div>
                      <ul className="divide-y divide-[#F0F1F3]">
                        {items.map(({ key, title, desc, icon: Icon }) => {
                          const selected = active === key;
                          const ok = isSectionComplete(key, sections);
                          return (
                            <li key={key}>
                              <button
                                type="button"
                                onClick={() => selectSection(key)}
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
                                  <p className="text-sm font-semibold text-[#1A2332]">
                                    {title}
                                  </p>
                                  <p className="text-xs text-[#6B7280] mt-0.5 truncate">
                                    {desc}
                                  </p>
                                </div>
                                {ok && (
                                  <span className="mt-1 w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0">
                                    <Check
                                      className="w-3 h-3 text-white"
                                      strokeWidth={3}
                                    />
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-[#E8EAED] p-5 lg:p-6 tk-admin-panel-swap">
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#1A2332]">
                    {activeMeta.title}
                  </h2>
                  <p className="text-sm text-[#6B7280] mt-0.5">{activeMeta.desc}</p>
                  <p className="text-xs text-[#94A3B8] mt-2">
                    Switch language to edit Thai or Polish copy.
                  </p>
                  <div className="mt-3">
                    <LocaleTabs locale={locale} onChange={setLocale} />
                  </div>
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
                locale={locale}
                data={
                  active === "siteChrome"
                    ? { nav: sections.nav || {}, seo: sections.seo || {} }
                    : sections[active] || {}
                }
                onChange={(next) => {
                  if (active === "siteChrome") {
                    setSections((prev) => ({
                      ...prev,
                      nav: next.nav || {},
                      seo: next.seo || {},
                    }));
                    return;
                  }
                  patch(active, next);
                }}
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
                    if (
                      !confirm(
                        "Reload this page from server (discard unsaved)?"
                      )
                    )
                      return;
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
  locale,
}: {
  sectionKey: string;
  data: any;
  onChange: (next: any) => void;
  locale: LocaleCode;
}) {
  if (sectionKey === "hero") {
    return (
      <div className="space-y-4">
        <Field
          locale={locale}
          label="Subtitle"
          value={data.subtitle || ""}
          onChange={(v) => onChange({ ...data, subtitle: v })}
        />
        <Field
          locale={locale}
          label="Title"
          value={data.title || ""}
          onChange={(v) => onChange({ ...data, title: v })}
        />
        <Field
          locale={locale}
          label="Description"
          multiline
          value={data.description || ""}
          onChange={(v) => onChange({ ...data, description: v })}
        />
        <Field
          locale={locale}
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

  if (sectionKey === "siteChrome") {
    const nav = data.nav || {};
    const seo = data.seo || {};
    const links = Array.isArray(nav.links) ? nav.links : [];
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
            Navigation
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              locale={locale}
              label="Consultation button"
              value={nav.consultationLabel || ""}
              onChange={(v) =>
                onChange({ ...data, nav: { ...nav, consultationLabel: v } })
              }
            />
            <Field
              locale={locale}
              label="Search placeholder"
              value={nav.searchPlaceholder || ""}
              onChange={(v) =>
                onChange({ ...data, nav: { ...nav, searchPlaceholder: v } })
              }
            />
          </div>
          {links.map((link: any, i: number) => (
            <div
              key={i}
              className="rounded-xl border border-[#E8EAED] p-4 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
            >
              <Field
                locale={locale}
                label={`Link label #${i + 1}`}
                value={link.label || ""}
                onChange={(v) => {
                  const next = [...links];
                  next[i] = { ...link, label: v };
                  onChange({ ...data, nav: { ...nav, links: next } });
                }}
              />
              <Field
                locale={locale}
                shared
                label="Href"
                value={link.href || ""}
                onChange={(v) => {
                  const next = [...links];
                  next[i] = { ...link, href: v };
                  onChange({ ...data, nav: { ...nav, links: next } });
                }}
              />
              <button
                type="button"
                className="text-xs text-red-600 pb-3"
                onClick={() =>
                  onChange({
                    ...data,
                    nav: {
                      ...nav,
                      links: links.filter((_: any, idx: number) => idx !== i),
                    },
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <AddItemButton
            label="Add nav link"
            onClick={() =>
              onChange({
                ...data,
                nav: {
                  ...nav,
                  links: [...links, { label: "", href: "/" }],
                },
              })
            }
          />
        </div>
        <div className="space-y-4 border-t border-[#E8EAED] pt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
            SEO
          </p>
          <Field
            locale={locale}
            label="Page title"
            value={seo.title || ""}
            onChange={(v) => onChange({ ...data, seo: { ...seo, title: v } })}
          />
          <Field
            locale={locale}
            label="Meta description"
            multiline
            value={seo.description || ""}
            onChange={(v) =>
              onChange({ ...data, seo: { ...seo, description: v } })
            }
          />
          <MediaUpload
            label="OG image (optional)"
            kind="image"
            value={seo.ogImage || ""}
            onChange={(v) =>
              onChange({ ...data, seo: { ...seo, ogImage: v } })
            }
          />
        </div>
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
              locale={locale}
              label={`Stat #${i + 1} Label`}
              value={item.label || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, label: v };
                onChange({ ...data, items: next });
              }}
            />
            <Field
              locale={locale}
              shared
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
                locale={locale}
                shared
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
        <div className="rounded-xl border border-[#E8EAED] bg-[#F8FAFC] p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
            Home section heading
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              locale={locale}
              label="Eyebrow"
              value={data.eyebrow || ""}
              onChange={(v) => onChange({ ...data, eyebrow: v })}
            />
            <Field
              locale={locale}
              label="Title"
              value={data.title || ""}
              onChange={(v) => onChange({ ...data, title: v })}
            />
          </div>
        </div>
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
              locale={locale}
              label="Title"
              value={item.title || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, title: v };
                onChange({ ...data, items: next });
              }}
            />
            <Field
              locale={locale}
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
          locale={locale}
          label="Title"
          value={data.title || ""}
          onChange={(v) => onChange({ ...data, title: v })}
        />
        <Field
          locale={locale}
          label="Subtitle"
          value={data.subtitle || ""}
          onChange={(v) => onChange({ ...data, subtitle: v })}
        />
        <Field
          locale={locale}
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
                locale={locale}
                label="Pillar Title"
                value={item.title || ""}
                onChange={(v) => {
                  const next = [...pillars];
                  next[i] = { ...item, title: v };
                  onChange({ ...data, pillars: next });
                }}
              />
              <Field
                locale={locale}
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
        <div className="rounded-xl border border-[#E8EAED] bg-[#F8FAFC] p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
            Home section heading
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              locale={locale}
              label="Eyebrow"
              value={data.eyebrow || ""}
              onChange={(v) => onChange({ ...data, eyebrow: v })}
            />
            <Field
              locale={locale}
              label="Title"
              value={data.title || ""}
              onChange={(v) => onChange({ ...data, title: v })}
            />
          </div>
        </div>
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
              locale={locale}
              label="Name"
              value={item.name || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, name: v };
                onChange({ ...data, items: next });
              }}
            />
            <Field
              locale={locale}
              label="Role"
              value={item.role || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, role: v };
                onChange({ ...data, items: next });
              }}
            />
            <Field
              locale={locale}
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
              locale={locale}
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
        <div className="rounded-xl border border-[#E8EAED] bg-[#F8FAFC] p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
            Home section heading
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              locale={locale}
              label="Eyebrow"
              value={data.eyebrow || ""}
              onChange={(v) => onChange({ ...data, eyebrow: v })}
            />
            <Field
              locale={locale}
              label="Title"
              value={data.title || ""}
              onChange={(v) => onChange({ ...data, title: v })}
            />
          </div>
        </div>
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
                locale={locale}
                label="Title"
                value={item.title || ""}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...item, title: v };
                  onChange({ ...data, items: next });
                }}
              />
              <Field
                locale={locale}
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
                locale={locale}
                label="Legacy file name (optional)"
                value={item.fileName || ""}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...item, fileName: v };
                  onChange({ ...data, items: next });
                }}
              />
              <Field
                locale={locale}
                shared
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
              locale={locale}
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
        <p className="text-xs text-[#6B7280] rounded-lg bg-[#F8FAFC] border border-[#E8EAED] px-3 py-2">
          These FAQs appear on the <strong>homepage</strong> above Get in Touch
          (first <strong>5</strong> items only). Use <strong>View all FAQs</strong> on
          the site to open the full /faq page. Dedicated FAQs under{" "}
          <strong>FAQs</strong> in the sidebar still power /faq when any exist.
        </p>
        <Field
          locale={locale}
          label="Eyebrow"
          value={data.eyebrow || ""}
          onChange={(v) => onChange({ ...data, eyebrow: v })}
        />
        <Field
          locale={locale}
          label="Section title"
          value={data.title || ""}
          onChange={(v) => onChange({ ...data, title: v })}
        />
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
              locale={locale}
              label={`Question #${i + 1}`}
              value={item.question || ""}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, question: v };
                onChange({ ...data, items: next });
              }}
            />
            <Field
              locale={locale}
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

  if (sectionKey === "productsPage") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-[#E8EAED] bg-[#F8FAFC] p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
            Homepage “Our Products” band (scroll order 05)
          </p>
          <Field
            locale={locale}
            label="Eyebrow"
            value={data.homeEyebrow || ""}
            onChange={(v) => onChange({ ...data, homeEyebrow: v })}
          />
          <Field
            locale={locale}
            label="Title"
            value={data.homeTitle || ""}
            onChange={(v) => onChange({ ...data, homeTitle: v })}
          />
          <Field
            locale={locale}
            label="CTA label"
            value={data.homeCta || ""}
            onChange={(v) => onChange({ ...data, homeCta: v })}
          />
        </div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#334155] pt-2">
          Products page hero (/products)
        </p>
        <Field
          locale={locale}
          label="Eyebrow / Label"
          value={data.label || ""}
          onChange={(v) => onChange({ ...data, label: v })}
        />
        <Field
          locale={locale}
          label="Title"
          value={data.title || ""}
          onChange={(v) => onChange({ ...data, title: v })}
        />
        <HeroVideoUpload
          value={data.videoUrl || ""}
          onChange={(v) => onChange({ ...data, videoUrl: v })}
        />
      </div>
    );
  }

  if (sectionKey === "blogPage") {
    const shareLinks = Array.isArray(data.shareLinks) ? data.shareLinks : [];
    return (
      <div className="space-y-4">
        <Field
          locale={locale}
          label="Eyebrow"
          value={data.eyebrow || ""}
          onChange={(v) => onChange({ ...data, eyebrow: v })}
        />
        <Field
          locale={locale}
          label="Title"
          value={data.title || ""}
          onChange={(v) => onChange({ ...data, title: v })}
        />
        <HeroVideoUpload
          value={data.videoUrl || ""}
          onChange={(v) => onChange({ ...data, videoUrl: v })}
        />
        <Field
          locale={locale}
          label="Related articles heading"
          value={data.relatedTitle || ""}
          onChange={(v) => onChange({ ...data, relatedTitle: v })}
        />
        <div className="space-y-3 border-t border-[#E8EAED] pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
            Share links
          </p>
          {shareLinks.map((link: any, i: number) => (
            <div
              key={i}
              className="rounded-xl border border-[#E8EAED] p-4 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
            >
              <Field
                locale={locale}
                label="Label"
                value={link.label || ""}
                onChange={(v) => {
                  const next = [...shareLinks];
                  next[i] = { ...link, label: v };
                  onChange({ ...data, shareLinks: next });
                }}
              />
              <Field
                locale={locale}
                label="URL"
                value={link.href || ""}
                onChange={(v) => {
                  const next = [...shareLinks];
                  next[i] = { ...link, href: v };
                  onChange({ ...data, shareLinks: next });
                }}
              />
              <button
                type="button"
                className="text-xs text-red-600 pb-3"
                onClick={() =>
                  onChange({
                    ...data,
                    shareLinks: shareLinks.filter(
                      (_: any, idx: number) => idx !== i
                    ),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <AddItemButton
            label="Add share link"
            onClick={() =>
              onChange({
                ...data,
                shareLinks: [...shareLinks, { label: "", href: "" }],
              })
            }
          />
        </div>
      </div>
    );
  }

  if (sectionKey === "faqPage") {
    return (
      <div className="space-y-4">
        <Field
          locale={locale}
          label="Eyebrow"
          value={data.eyebrow || ""}
          onChange={(v) => onChange({ ...data, eyebrow: v })}
        />
        <Field
          locale={locale}
          label="Title"
          value={data.title || ""}
          onChange={(v) => onChange({ ...data, title: v })}
        />
        <HeroVideoUpload
          value={data.videoUrl || ""}
          onChange={(v) => onChange({ ...data, videoUrl: v })}
        />
      </div>
    );
  }

  if (sectionKey === "contactPage") {
    const locations = Array.isArray(data.locations) ? data.locations : [];
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field
            locale={locale}
            label="Hero title"
            value={data.title || ""}
            onChange={(v) => onChange({ ...data, title: v })}
          />
          <Field
            locale={locale}
            label="Hero title accent"
            value={data.titleAccent || ""}
            onChange={(v) => onChange({ ...data, titleAccent: v })}
          />
        </div>
        <Field
          locale={locale}
          label="Hero description"
          multiline
          value={data.description || ""}
          onChange={(v) => onChange({ ...data, description: v })}
        />
        <HeroVideoUpload
          value={data.videoUrl || ""}
          onChange={(v) => onChange({ ...data, videoUrl: v })}
        />
        <MediaUpload
          label="Craft / side image"
          kind="image"
          value={data.craftImage || ""}
          onChange={(v) => onChange({ ...data, craftImage: v })}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field
            locale={locale}
            shared
            label="Email"
            value={data.email || ""}
            onChange={(v) => onChange({ ...data, email: v })}
          />
          <Field
            locale={locale}
            shared
            label="Phone"
            value={data.phone || ""}
            onChange={(v) => onChange({ ...data, phone: v })}
          />
        </div>
        {locations.map((loc: any, i: number) => (
          <div key={i} className="rounded-xl border border-[#E8EAED] p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-[#5C6370]">
                Location #{i + 1}
              </p>
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() =>
                  onChange({
                    ...data,
                    locations: locations.filter((_: any, idx: number) => idx !== i),
                  })
                }
              >
                Remove
              </button>
            </div>
            <Field
              locale={locale}
              label="Title"
              value={loc.title || ""}
              onChange={(v) => {
                const next = [...locations];
                next[i] = { ...loc, title: v };
                onChange({ ...data, locations: next });
              }}
            />
            <Field
              locale={locale}
              label="Address"
              multiline
              value={loc.address || ""}
              onChange={(v) => {
                const next = [...locations];
                next[i] = { ...loc, address: v };
                onChange({ ...data, locations: next });
              }}
            />
          </div>
        ))}
        <AddItemButton
          label="Add location"
          onClick={() =>
            onChange({
              ...data,
              locations: [...locations, { title: "", address: "" }],
            })
          }
        />
      </div>
    );
  }

  if (sectionKey === "footer") {
    const homeLinks = Array.isArray(data.homeLinks) ? data.homeLinks : [];
    const productLinks = Array.isArray(data.productLinks)
      ? data.productLinks
      : [];
    return (
      <div className="space-y-4">
        <MediaUpload
          label="Footer logo"
          kind="image"
          value={data.logoUrl || ""}
          onChange={(v) => onChange({ ...data, logoUrl: v })}
        />
        <Field
          locale={locale}
          label="Tagline (optional)"
          value={data.tagline || ""}
          onChange={(v) => onChange({ ...data, tagline: v })}
        />
        <Field
          locale={locale}
          label="Address"
          value={data.address || ""}
          onChange={(v) => onChange({ ...data, address: v })}
        />
        <Field
          locale={locale}
          shared
          label="Email"
          value={data.email || ""}
          onChange={(v) => onChange({ ...data, email: v })}
        />
        <Field
          locale={locale}
          shared
          label="Phone"
          value={data.phone || ""}
          onChange={(v) => onChange({ ...data, phone: v })}
        />
        <div className="grid sm:grid-cols-3 gap-3">
          <Field
            locale={locale}
            shared
            label="Facebook"
            value={data.facebook || ""}
            onChange={(v) => onChange({ ...data, facebook: v })}
          />
          <Field
            locale={locale}
            shared
            label="Instagram"
            value={data.instagram || ""}
            onChange={(v) => onChange({ ...data, instagram: v })}
          />
          <Field
            locale={locale}
            label="LINE"
            value={data.line || ""}
            onChange={(v) => onChange({ ...data, line: v })}
          />
        </div>
        <div className="space-y-3 border-t border-[#E8EAED] pt-4">
          <Field
            locale={locale}
            label="Home column title"
            value={data.homeColumnTitle || ""}
            onChange={(v) => onChange({ ...data, homeColumnTitle: v })}
          />
          {homeLinks.map((link: any, i: number) => (
            <div
              key={i}
              className="rounded-xl border border-[#E8EAED] p-4 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
            >
              <Field
                locale={locale}
                label="Label"
                value={link.label || ""}
                onChange={(v) => {
                  const next = [...homeLinks];
                  next[i] = { ...link, label: v };
                  onChange({ ...data, homeLinks: next });
                }}
              />
              <Field
                locale={locale}
                shared
                label="Href"
                value={link.href || ""}
                onChange={(v) => {
                  const next = [...homeLinks];
                  next[i] = { ...link, href: v };
                  onChange({ ...data, homeLinks: next });
                }}
              />
              <button
                type="button"
                className="text-xs text-red-600 pb-3"
                onClick={() =>
                  onChange({
                    ...data,
                    homeLinks: homeLinks.filter(
                      (_: any, idx: number) => idx !== i
                    ),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <AddItemButton
            label="Add home link"
            onClick={() =>
              onChange({
                ...data,
                homeLinks: [...homeLinks, { label: "", href: "/" }],
              })
            }
          />
        </div>
        <div className="space-y-3 border-t border-[#E8EAED] pt-4">
          <Field
            locale={locale}
            label="Product column title"
            value={data.productColumnTitle || ""}
            onChange={(v) => onChange({ ...data, productColumnTitle: v })}
          />
          {productLinks.map((link: any, i: number) => (
            <div
              key={i}
              className="rounded-xl border border-[#E8EAED] p-4 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
            >
              <Field
                locale={locale}
                label="Label"
                value={link.label || ""}
                onChange={(v) => {
                  const next = [...productLinks];
                  next[i] = { ...link, label: v };
                  onChange({ ...data, productLinks: next });
                }}
              />
              <Field
                locale={locale}
                shared
                label="Href"
                value={link.href || ""}
                onChange={(v) => {
                  const next = [...productLinks];
                  next[i] = { ...link, href: v };
                  onChange({ ...data, productLinks: next });
                }}
              />
              <button
                type="button"
                className="text-xs text-red-600 pb-3"
                onClick={() =>
                  onChange({
                    ...data,
                    productLinks: productLinks.filter(
                      (_: any, idx: number) => idx !== i
                    ),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <AddItemButton
            label="Add product link"
            onClick={() =>
              onChange({
                ...data,
                productLinks: [...productLinks, { label: "", href: "/" }],
              })
            }
          />
        </div>
      </div>
    );
  }

  return <p className="text-sm text-[#6B7280]">Unknown section</p>;
}
