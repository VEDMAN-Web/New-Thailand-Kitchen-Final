"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  CloudUpload,
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
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import MediaUpload from "@/components/MediaUpload";
import HeroVideoUpload from "@/components/HeroVideoUpload";
import SectionBlocksEditor, {
  sectionsFromApi,
  sectionsToApiPayload,
} from "@/components/SectionBlocksEditor";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { getHome, resetHome, updateHome } from "@/services/adminAPI";
import {
  ADMIN_SECTION_EVENT,
  CMS_SYNCED_EVENT,
  readAdminSectionFromUrl,
  writeAdminSectionToUrl,
} from "@/lib/adminSectionNav";
import { clsx } from "clsx";
import LocaleTabs from "@/components/LocaleTabs";
import {
  localizedValue,
  writeLocalized,
  type LocaleCode,
  type LocalizedText,
} from "@/lib/localized";

type Sections = Record<string, any>;

type SectionGroup = "chrome" | "home" | "pages";

const SECTION_META = [
  // —— Site-wide (navbar lives on every page) ——
  {
    key: "siteChrome",
    title: "Header & SEO",
    desc: "Top menu, Free Consultation button, logo & Google SEO",
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
    desc: "Eyebrow & title — Q&A from Admin → FAQ (first 5 on home)",
    icon: HelpCircle,
    group: "home" as SectionGroup,
  },
  {
    key: "homeContact",
    title: "11 · Home Contact",
    desc: "Get in Touch form band under FAQ on the homepage",
    icon: Contact,
    group: "home" as SectionGroup,
  },
  {
    key: "footer",
    title: "12 · Footer",
    desc: "Logo, link columns, contact & social",
    icon: Contact,
    group: "home" as SectionGroup,
  },
  // —— Other website pages (same order as main nav: Blog → Contact → FAQ) ——
  {
    key: "blogPage",
    title: "Guides Page",
    desc: "Guides (/guides) hero, share links & related heading",
    icon: Newspaper,
    group: "pages" as SectionGroup,
  },
  {
    key: "hubPages",
    title: "Kitchens, Services, Materials, Locations",
    desc: "Overview pages for Kitchens, Services, Materials, Locations & Built-In Furniture",
    icon: LayoutGrid,
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
];

const HOME_RAIL_META = SECTION_META.filter((m) => m.group !== "pages");

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
      return Boolean(localizedValue(s.title, "en") || localizedValue(s.eyebrow, "en"));
    case "homeContact":
      return Boolean(
        localizedValue(s.title, "en") || localizedValue(s.formTitle, "en")
      );
    case "footer":
      return Boolean(s.email || s.address || s.phone || s.logoUrl);
    case "productsPage":
      return Boolean(localizedValue(s.title, "en") || s.videoUrl || localizedValue(s.label, "en") || localizedValue(s.homeTitle, "en"));
    case "blogPage":
      return Boolean(localizedValue(s.title, "en") || s.videoUrl || localizedValue(s.eyebrow, "en"));
    case "hubPages":
      return Boolean(
        localizedValue(s.kitchens?.title, "en") ||
          localizedValue(s.services?.title, "en")
      );
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

  // Focus a specific hub block when linked as /?section=hubPages&hub=kitchens
  useEffect(() => {
    if (active !== "hubPages" || typeof window === "undefined") return;
    const hubKey = new URLSearchParams(window.location.search).get("hub");
    if (!hubKey) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`hub-${hubKey}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [active, loading]);

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

  // Reload home sections after header "Sync from DB"
  useEffect(() => {
    const onSynced = () => {
      void load();
    };
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const doneCount = useMemo(
    () => HOME_RAIL_META.filter((m) => isSectionComplete(m.key, sections)).length,
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
  const showHomeRail = HOME_RAIL_META.some((m) => m.key === active);

  return (
    <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {showHomeRail ? (
              <>
                <span className="text-xs font-bold tracking-[0.1em] uppercase text-[#5C6370]">
                  Home Management
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] text-[#166534] text-xs font-semibold px-2.5 py-1">
                  <Check className="w-3.5 h-3.5" />
                  {doneCount} of {HOME_RAIL_META.length} Sections Ready
                </span>
              </>
            ) : (
              <span className="text-xs font-bold tracking-[0.1em] uppercase text-[#5C6370]">
                {activeMeta.title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={saveAll}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[#243044] disabled:opacity-60"
            >
              <CloudUpload className="w-4 h-4" />
              Save
            </button>
            {showHomeRail ? (
              <button
                type="button"
                onClick={onResetPage}
                disabled={saving}
                className="text-sm font-medium text-[#6B7280] underline-offset-2 hover:text-[#DC2626] hover:underline disabled:opacity-60"
              >
                Reset to defaults
              </button>
            ) : null}
          </div>
        </div>

        {showInitialLoader ? (
          <p className="text-sm text-[#6B7280]">Loading sections…</p>
        ) : (
          <div
            className={
              showHomeRail
                ? "grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-5 items-start"
                : "grid grid-cols-1 gap-5 items-start"
            }
          >
            {showHomeRail ? (
            <div className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8EAED] flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#5C6370]">
                  Same order as website
                </span>
                <span className="text-xs font-semibold text-[#16A34A]">
                  {doneCount}/{HOME_RAIL_META.length} Done
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
            ) : null}

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
          <MediaUpload
            label="Header logo"
            kind="image"
            value={nav.logoUrl || ""}
            onChange={(v) =>
              onChange({ ...data, nav: { ...nav, logoUrl: v } })
            }
          />
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
          <Field
            locale="en"
            shared
            label="GA4 Measurement ID (e.g. G-XXXXXXXXXX)"
            value={seo.ga4MeasurementId || ""}
            onChange={(v) =>
              onChange({ ...data, seo: { ...seo, ga4MeasurementId: v } })
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
            <div className="max-w-[140px]">
              <label className="mb-1.5 block text-xs font-semibold text-[#5C6370]">
                Rating (1-5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                step={1}
                inputMode="numeric"
                value={
                  typeof item.rating === "number" && item.rating >= 1
                    ? item.rating
                    : ""
                }
                onChange={(e) => {
                  const raw = e.target.value;
                  const next = [...items];
                  if (raw === "") {
                    next[i] = { ...item, rating: "" };
                    onChange({ ...data, items: next });
                    return;
                  }
                  const n = Number(raw);
                  if (!Number.isFinite(n)) return;
                  next[i] = {
                    ...item,
                    rating: Math.min(5, Math.max(1, Math.round(n))),
                  };
                  onChange({ ...data, items: next });
                }}
                onBlur={() => {
                  const n = Number(item.rating);
                  const rating =
                    Number.isFinite(n) && n >= 1 && n <= 5
                      ? Math.round(n)
                      : 5;
                  if (item.rating === rating) return;
                  const next = [...items];
                  next[i] = { ...item, rating };
                  onChange({ ...data, items: next });
                }}
                className="w-full rounded-lg border border-[#E2E5EA] bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/15 focus:border-[#1A2332]"
              />
            </div>
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
        <div className="rounded-xl border border-[#E8EAED] bg-[#F8FAFC] p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
            /catalogue page heading
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              locale={locale}
              label="Page eyebrow"
              value={data.pageEyebrow || ""}
              onChange={(v) => onChange({ ...data, pageEyebrow: v })}
            />
            <Field
              locale={locale}
              label="Page title"
              value={data.pageTitle || ""}
              onChange={(v) => onChange({ ...data, pageTitle: v })}
            />
          </div>
          <Field
            locale={locale}
            label="Page description"
            multiline
            value={data.pageDescription || ""}
            onChange={(v) => onChange({ ...data, pageDescription: v })}
          />
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
    return (
      <div className="space-y-4">
        <p className="text-xs text-[#6B7280] rounded-lg bg-[#F8FAFC] border border-[#E8EAED] px-3 py-2">
          Homepage FAQ band uses the eyebrow/title below. Q&amp;A items come from{" "}
          <strong>Admin → FAQ</strong> (first 5 on home). Edit the full /faq page
          hero under <strong>FAQ → Page hero</strong>.
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
      </div>
    );
  }

  if (sectionKey === "homeContact") {
    return (
      <div className="space-y-4">
        <p className="text-xs text-[#6B7280] rounded-lg bg-[#F8FAFC] border border-[#E8EAED] px-3 py-2">
          Homepage “Get in Touch” band (below FAQ). The full /contact page is
          edited under sidebar <strong>Contact</strong>.
        </p>
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
        <Field
          locale={locale}
          label="Form title"
          multiline
          value={data.formTitle || ""}
          onChange={(v) => onChange({ ...data, formTitle: v })}
        />
        <MediaUpload
          label="Side image"
          value={String(data.image || "")}
          onChange={(v) => onChange({ ...data, image: v })}
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

  if (sectionKey === "hubPages") {
    const hubs: { order: string; key: string; label: string; path: string }[] = [
      { order: "1", key: "kitchens", label: "Kitchens", path: "/kitchens" },
      { order: "2", key: "services", label: "Services", path: "/services" },
      { order: "3", key: "materials", label: "Materials", path: "/materials" },
      { order: "4", key: "locations", label: "Locations", path: "/locations" },
      {
        order: "5",
        key: "builtInFurniture",
        label: "Built-In Furniture",
        path: "/built-in-furniture",
      },
    ];
    const kitchenSubsections: {
      order: string;
      key: string;
      label: string;
      path: string;
    }[] = [
      {
        order: "1a",
        key: "layouts",
        label: "Layouts",
        path: "/kitchens/layouts",
      },
      {
        order: "1b",
        key: "styles",
        label: "Styles",
        path: "/kitchens/styles",
      },
      {
        order: "1c",
        key: "byProperty",
        label: "By Property",
        path: "/kitchens/by-property",
      },
    ];

    const renderHubFields = (
      hub: Record<string, unknown>,
      onHubChange: (next: Record<string, unknown>) => void,
      prefix: string
    ) => (
      <>
        <Field
          locale={locale}
          label={`${prefix} hero tag (small uppercase, e.g. STYLES / MATERIALS)`}
          value={(hub.eyebrow as string) || ""}
          onChange={(v) => onHubChange({ ...hub, eyebrow: v })}
        />
        <MediaUpload
          label={`${prefix} hero background image (full-bleed overlay)`}
          value={String(hub.heroImage || "")}
          onChange={(v) => onHubChange({ ...hub, heroImage: v })}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field
            locale={locale}
            label={`${prefix} hero button label`}
            value={(hub.ctaLabel as string) || ""}
            onChange={(v) => onHubChange({ ...hub, ctaLabel: v })}
          />
          <Field
            locale={locale}
            shared
            label={`${prefix} hero button link`}
            value={String(hub.ctaHref || "")}
            onChange={(v) => onHubChange({ ...hub, ctaHref: v })}
          />
        </div>
        <SectionBlocksEditor
          locale={locale}
          label={`${prefix} content sections`}
          sections={sectionsFromApi(hub.sections)}
          onChange={(next) =>
            onHubChange({ ...hub, sections: sectionsToApiPayload(next) })
          }
        />
      </>
    );

    return (
      <div className="space-y-6">
        <p className="text-sm text-[#5C6370] rounded-lg border border-[#E8EDF2] bg-[#F8FAFC] px-4 py-3">
          Hub landing pages show hero + content sections. Kitchens, Materials,
          and Built-In Furniture share the same full-bleed overlay hero (tag,
          title, description, button, background image). Category pages
          (Traditional Thai, Brass Hardware, Entertainment Units, etc.) are
          edited under <strong>Categories</strong> with the same hero fields.
        </p>
        {hubs.map(({ order, key, label, path }) => {
          const hub = data[key] || {};
          return (
            <div
              key={key}
              id={`hub-${key}`}
              className="rounded-xl border border-[#E8EAED] p-4 space-y-3 scroll-mt-4"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md bg-[#1A2332] px-2 text-[11px] font-bold text-white">
                  {order}
                </span>
                <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
                  {label}{" "}
                  <span className="font-mono font-normal text-[#6B7280]">
                    {path}
                  </span>
                </p>
              </div>
              <Field
                locale={locale}
                label="Hero heading"
                value={hub.title || ""}
                onChange={(v) =>
                  onChange({ ...data, [key]: { ...hub, title: v } })
                }
              />
              <Field
                locale={locale}
                label="Hero description"
                multiline
                value={hub.description || ""}
                onChange={(v) =>
                  onChange({ ...data, [key]: { ...hub, description: v } })
                }
              />
              {renderHubFields(hub, (next) => onChange({ ...data, [key]: next }), "Hub")}
              {key === "kitchens" ? (
                <div className="space-y-4 rounded-lg border border-[#E8EDF2] bg-[#F8FAFC] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">
                    Layouts, Styles, By Property
                  </p>
                  {kitchenSubsections.map(({ order, key: subKey, label: subLabel, path }) => {
                    const sub = hub.subsections?.[subKey] || {};
                    return (
                      <div
                        key={subKey}
                        className="space-y-3 rounded-lg border border-[#E8EAED] bg-white p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-md bg-[#334155] px-2 text-[10px] font-bold text-white">
                            {order}
                          </span>
                          <p className="text-xs font-semibold text-[#334155]">
                            {subLabel}{" "}
                            <span className="font-mono font-normal text-[#6B7280]">
                              {path}
                            </span>
                          </p>
                        </div>
                        <Field
                          locale={locale}
                          label="Hero heading"
                          value={sub.title || ""}
                          onChange={(v) =>
                            onChange({
                              ...data,
                              [key]: {
                                ...hub,
                                subsections: {
                                  ...(hub.subsections || {}),
                                  [subKey]: { ...sub, title: v },
                                },
                              },
                            })
                          }
                        />
                        <Field
                          locale={locale}
                          label="Hero description"
                          multiline
                          value={sub.description || ""}
                          onChange={(v) =>
                            onChange({
                              ...data,
                              [key]: {
                                ...hub,
                                subsections: {
                                  ...(hub.subsections || {}),
                                  [subKey]: { ...sub, description: v },
                                },
                              },
                            })
                          }
                        />
                        {renderHubFields(
                          sub,
                          (next) =>
                            onChange({
                              ...data,
                              [key]: {
                                ...hub,
                                subsections: {
                                  ...(hub.subsections || {}),
                                  [subKey]: next,
                                },
                              },
                            }),
                          subLabel
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
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
