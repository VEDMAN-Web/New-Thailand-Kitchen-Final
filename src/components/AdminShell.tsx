"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  Package,
  FileText,
  Shield,
  ScrollText,
  Users,
  LogOut,
  ChevronDown,
  Images,
  FolderKanban,
  MessageCircleQuestion,
  BookOpen,
  BriefcaseBusiness,
  MapPin,
  Settings,
  Inbox,
  Wrench,
  Sparkles,
  LayoutGrid,
  RefreshCw,
  X,
  Database,
} from "lucide-react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import type { SiteId } from "@/services/adminAPI";
import { syncSiteFromDb } from "@/services/adminAPI";
import { syncVarsoviaFromDb } from "@/services/varsoviaAPI";
import { toast } from "sonner";
import { clsx } from "clsx";
import {
  ADMIN_SECTION_EVENT,
  VARSOVIA_NAV_EVENT,
  emitCmsSynced,
  readAdminSectionFromUrl,
  readVarsoviaNavFromUrl,
  writeAdminSectionToUrl,
  writeVarsoviaNav,
  type VarsoviaNavDetail,
} from "@/lib/adminSectionNav";

const THAILAND_NAV: {
  href: string;
  label: string;
  icon: typeof Home;
  section?: string;
  /** Match /categories?hub=… exactly when set */
  hub?: string;
  group?: "pages" | "chrome" | "admin";
}[] = [
  // Same names + order as the live thailandkitchens.com header
  { href: "/", label: "Home", icon: Home, group: "pages" },
  {
    href: "/categories?hub=kitchens",
    label: "Kitchens",
    icon: LayoutGrid,
    hub: "kitchens",
    group: "pages",
  },
  { href: "/products", label: "Products", icon: Package, group: "pages" },
  {
    href: "/categories?hub=services",
    label: "Services",
    icon: Wrench,
    hub: "services",
    group: "pages",
  },
  {
    href: "/categories?hub=materials",
    label: "Materials",
    icon: Sparkles,
    hub: "materials",
    group: "pages",
  },
  {
    href: "/categories?hub=locations",
    label: "Locations",
    icon: MapPin,
    hub: "locations",
    group: "pages",
  },
  {
    href: "/categories?hub=built-in-furniture",
    label: "Built-In Furniture",
    icon: FolderKanban,
    hub: "built-in-furniture",
    group: "pages",
  },
  { href: "/gallery", label: "Gallery", icon: Images, group: "pages" },
  { href: "/blogs", label: "Guides", icon: FileText, group: "pages" },
  {
    href: "/?section=contactPage",
    label: "Contact",
    icon: BriefcaseBusiness,
    section: "contactPage",
    group: "pages",
  },
  { href: "/faqs", label: "FAQ", icon: MessageCircleQuestion, group: "pages" },

  { href: "/privacy", label: "Privacy Policy", icon: Shield, group: "chrome" },
  { href: "/terms", label: "Terms & Conditions", icon: ScrollText, group: "chrome" },

  { href: "/contacts", label: "Contact Inbox", icon: Inbox, group: "admin" },
  { href: "/users", label: "Users", icon: Users, group: "admin" },
];

const VARSOVIA_NAV: {
  href: string;
  label: string;
  icon: typeof Home;
  resource?: string;
  section?: string;
  group: "pages" | "chrome" | "content" | "admin";
}[] = [
  // Website pages — live site order & names (match navbar / page H1s)
  { href: "/varsovia?resource=site", resource: "site", label: "Home", icon: Home, group: "pages" },
  {
    href: "/varsovia/furniture",
    label: "Furniture",
    icon: Package,
    group: "pages",
  },
  {
    href: "/varsovia/interior-design",
    label: "Interior",
    icon: LayoutGrid,
    group: "pages",
  },
  {
    href: "/varsovia?resource=site&section=projectsPage",
    resource: "site",
    section: "projectsPage",
    label: "Showcase",
    icon: Images,
    group: "pages",
  },
  {
    href: "/varsovia/locations",
    label: "Locations",
    icon: MapPin,
    group: "pages",
  },
  {
    href: "/varsovia?resource=site&section=aboutPage",
    resource: "site",
    section: "aboutPage",
    label: "About Us",
    icon: BookOpen,
    group: "pages",
  },
  {
    href: "/varsovia/about-brand",
    label: "About brands",
    icon: BookOpen,
    group: "pages",
  },
  {
    href: "/varsovia/services",
    label: "Services",
    icon: Wrench,
    group: "pages",
  },
  {
    href: "/varsovia/complete-interiors",
    label: "Complete Interiors",
    icon: FolderKanban,
    group: "pages",
  },
  {
    href: "/varsovia/for-developers",
    label: "For Developers",
    icon: BriefcaseBusiness,
    group: "pages",
  },
  {
    href: "/varsovia/journal",
    label: "Journal",
    icon: FileText,
    group: "pages",
  },
  {
    href: "/varsovia?resource=site&section=cataloguePage",
    resource: "site",
    section: "cataloguePage",
    label: "Free Catalogue",
    icon: BookOpen,
    group: "pages",
  },
  {
    href: "/varsovia?resource=site&section=teamPage",
    resource: "site",
    section: "teamPage",
    label: "Our Team",
    icon: BriefcaseBusiness,
    group: "pages",
  },
  {
    href: "/varsovia?resource=site&section=qualitySale",
    resource: "site",
    section: "qualitySale",
    label: "Quality After Sales",
    icon: Wrench,
    group: "pages",
  },
  {
    href: "/varsovia?resource=site&section=contactPage",
    resource: "site",
    section: "contactPage",
    label: "Contact",
    icon: MapPin,
    group: "pages",
  },
  {
    href: "/varsovia?resource=site&section=faqPage",
    resource: "site",
    section: "faqPage",
    label: "FAQ",
    icon: MessageCircleQuestion,
    group: "pages",
  },

  // Legal (same group as Thailand)
  {
    href: "/varsovia?resource=site&section=privacyPage",
    resource: "site",
    section: "privacyPage",
    label: "Privacy Policy",
    icon: Shield,
    group: "chrome",
  },
  {
    href: "/varsovia?resource=site&section=termsPage",
    resource: "site",
    section: "termsPage",
    label: "Terms of Use",
    icon: ScrollText,
    group: "chrome",
  },

  // Content libraries (not duplicated from Home rail sections)
  { href: "/varsovia?resource=blogs", resource: "blogs", label: "All articles", icon: FileText, group: "content" },
  { href: "/varsovia?resource=showcases", resource: "showcases", label: "Showcase items", icon: Images, group: "content" },
  { href: "/varsovia?resource=faqs", resource: "faqs", label: "FAQs", icon: MessageCircleQuestion, group: "content" },
  { href: "/varsovia?resource=team-members", resource: "team-members", label: "Team members", icon: Users, group: "content" },

  // Site chrome
  {
    href: "/varsovia?resource=site&section=brand",
    resource: "site",
    section: "brand",
    label: "Brand & Flags",
    icon: Settings,
    group: "admin",
  },
  {
    href: "/varsovia?resource=site&section=navigation",
    resource: "site",
    section: "navigation",
    label: "Navigation",
    icon: Settings,
    group: "admin",
  },
  {
    href: "/varsovia?resource=site&section=footer",
    resource: "site",
    section: "footer",
    label: "Footer",
    icon: Settings,
    group: "admin",
  },
  {
    href: "/varsovia?resource=site&section=interior",
    resource: "site",
    section: "interior",
    label: "Interior Mode",
    icon: FolderKanban,
    group: "admin",
  },
];


const THAILAND_HOME_SECTIONS = new Set([
  "siteChrome",
  "hero",
  "partners",
  "story",
  "transition",
  "productsPage",
  "testimonials",
  "statistics",
  "advantages",
  "faq",
  "homeContact",
  "footer",
]);

/** Home Site Settings sections — used so "Home" stays active while editing home blocks */
const VARSOVIA_HOME_SECTIONS = new Set([
  "hero",
  "about",
  "stats",
  "featured",
  "catalogue",
  "products",
  "testimonials",
  "coreStrengths",
  "partners",
  "contact",
]);

const VARSOVIA_PAGE_SECTIONS = new Set([
  "aboutPage",
  "teamPage",
  "qualitySale",
  "projectsPage",
  "faqPage",
  "cataloguePage",
  "contactPage",
  "privacyPage",
  "termsPage",
  "iaFurniture",
  "iaInteriorDesign",
  "iaCompleteInteriors",
  "iaServices",
  "iaLocations",
  "iaForDevelopers",
  "iaJournal",
  "iaAboutBrand",
]);

const SITES: { id: SiteId; name: string }[] = [
  { id: "thailand-kitchen", name: "Thailand Kitchen" },
  { id: "varsovia-kitchen", name: "Varsovia Kitchen" },
];

type AdminShellProps = {
  children: React.ReactNode;
  title: string;
};

export default function AdminShell(props: AdminShellProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F5F7] p-8 text-sm text-[#6B7280]">
          Loading admin…
        </div>
      }
    >
      <AdminShellContent {...props} />
    </Suspense>
  );
}

function AdminShellContent({
  children,
  title,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, siteId, setSiteId } = useAdminAuth();
  const isVarsovia = siteId === "varsovia-kitchen";
  const [profileOpen, setProfileOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [homeSection, setHomeSection] = useState<string | null>(null);
  const [varsoviaNav, setVarsoviaNav] = useState<VarsoviaNavDetail>(() =>
    readVarsoviaNavFromUrl()
  );

  useEffect(() => {
    setHomeSection(readAdminSectionFromUrl());
    const onSection = (event: Event) => {
      const key = (event as CustomEvent<string>).detail;
      setHomeSection(key === "hero" ? null : key);
    };
    window.addEventListener(ADMIN_SECTION_EVENT, onSection);
    return () => window.removeEventListener(ADMIN_SECTION_EVENT, onSection);
  }, [pathname]);

  useEffect(() => {
    if (!pathname.startsWith("/varsovia")) return;
    setVarsoviaNav(readVarsoviaNavFromUrl());
    const onNav = (event: Event) => {
      const detail = (event as CustomEvent<VarsoviaNavDetail>).detail;
      if (detail?.resource) setVarsoviaNav(detail);
    };
    const onPop = () => setVarsoviaNav(readVarsoviaNavFromUrl());
    window.addEventListener(VARSOVIA_NAV_EVENT, onNav);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener(VARSOVIA_NAV_EVENT, onNav);
      window.removeEventListener("popstate", onPop);
    };
  }, [pathname]);

  useEffect(() => {
    if (isVarsovia && !pathname.startsWith("/varsovia")) {
      router.replace("/varsovia?resource=site");
    } else if (!isVarsovia && pathname.startsWith("/varsovia")) {
      router.replace("/");
    }
  }, [isVarsovia, pathname, router]);

  useEffect(() => {
    if (!profileOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  /** Prefer soft-nav state; fall back to URL search params on first paint. */
  const requestedResource =
    varsoviaNav.resource || searchParams.get("resource") || "site";
  const activeResource = VARSOVIA_NAV.some(
    (item) => item.resource === requestedResource
  )
    ? requestedResource
    : "site";
  const currentSection =
    varsoviaNav.section ?? searchParams.get("section");

  /** Site Settings is a long form: pin the sidebar/header and scroll the form itself. */
  const lockShellHeight = pathname === "/varsovia" && activeResource === "site";

  useEffect(() => {
    if (!lockShellHeight) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lockShellHeight]);

  const isActive = (item: {
    href: string;
    resource?: string;
    section?: string;
    hub?: string;
  }) => {
    const pathOnly = item.href.split("?")[0];
    // Dedicated hub routes must match the real pathname, not /varsovia query state
    if (pathOnly.startsWith("/varsovia/")) {
      return pathname === pathOnly;
    }
    if (item.resource) {
      if (pathname !== "/varsovia" || activeResource !== item.resource) {
        return false;
      }
      if (item.section) {
        return currentSection === item.section;
      }
      // Home: resource=site with no section, or a home section
      if (item.resource === "site") {
        return !currentSection || VARSOVIA_HOME_SECTIONS.has(currentSection);
      }
      return true;
    }
    if (item.section) {
      return pathname === "/" && homeSection === item.section;
    }
    if (item.hub) {
      return (
        pathname === "/categories" &&
        searchParams.get("hub") === item.hub
      );
    }
    if (item.href === "/") {
      if (pathname !== "/") return false;
      if (!homeSection) return true;
      if (!THAILAND_HOME_SECTIONS.has(homeSection)) return false;
      return !THAILAND_NAV.some(
        (nav) => nav.section === homeSection && nav.href !== "/"
      );
    }
    if (pathOnly === "/categories") {
      return pathname === "/categories" && !searchParams.get("hub");
    }
    return pathname.startsWith(pathOnly);
  };

  const openNavItem = (
    event: React.MouseEvent,
    item: { href: string; section?: string; resource?: string }
  ) => {
    // Varsovia: stay on /varsovia and swap resource/section without Next navigation.
    // Dedicated hub pages (/varsovia/furniture, /about-brand, …) must actually
    // route — replaceState alone leaves the old page mounted.
    if (isVarsovia && item.resource) {
      const onDedicatedHub =
        pathname.startsWith("/varsovia/") && pathname !== "/varsovia";
      if (onDedicatedHub) {
        return;
      }
      if (pathname === "/varsovia" || pathname.startsWith("/varsovia")) {
        event.preventDefault();
        writeVarsoviaNav(item.resource, item.section || null);
        return;
      }
      return; // allow Link to land on /varsovia?...
    }

    // Thailand: same-page home section picks — no Suspense flicker
    if (item.section) {
      if (pathname === "/") {
        event.preventDefault();
        writeAdminSectionToUrl(item.section);
        return;
      }
      return; // allow Link to navigate to /?section=...
    }
    if (item.href === "/" && pathname === "/") {
      event.preventDefault();
      writeAdminSectionToUrl(null);
    }
  };

  useEffect(() => {
    if (!syncConfirmOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSyncConfirmOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [syncConfirmOpen]);

  const changeSite = (next: SiteId) => {
    setSiteId(next);
    router.push(
      next === "varsovia-kitchen" ? "/varsovia?resource=site" : "/"
    );
  };

  const openSyncConfirm = () => {
    if (syncing) return;
    setSyncConfirmOpen(true);
  };

  const runSyncFromDb = async () => {
    if (syncing) return;
    setSyncConfirmOpen(false);
    setSyncing(true);
    const brand = isVarsovia ? "Varsovia" : "Thailand Kitchen";
    const toastId = toast.loading(`Syncing ${brand} from connected database…`);
    try {
      if (isVarsovia) {
        const res = await syncVarsoviaFromDb();
        const report = res.report;
        const resourceBits = Object.entries(report.resources || {})
          .filter(([, n]) => Number(n) >= 0)
          .slice(0, 4)
          .map(([k, n]) => `${k}:${n}`);
        toast.success(res.message || "Sync complete", {
          id: toastId,
          description: [
            report.database,
            report.journalSync
              ? `Journal articles:${report.journalSync.total} (removed ${report.journalSync.deleted})`
              : null,
            report.siteUpdated
              ? `Site fields filled: ${report.filledSiteKeys}`
              : "Site fields unchanged",
            resourceBits.length ? resourceBits.join(" · ") : null,
          ]
            .filter(Boolean)
            .join(" · "),
          duration: 7000,
        });
        emitCmsSynced({ site: "varsovia-kitchen", report });
      } else {
        const res = await syncSiteFromDb(siteId);
        const report = res.report;
        const addedParts = Object.entries(report.added || {})
          .filter(([, n]) => Number(n) > 0)
          .map(([k, n]) => `${k}+${n}`);
        const nav = report.nav;
        const repaired = report.repaired;
        const blogSync = report.blogSync;
        const localeRepair = report.localeRepair;
        toast.success(res.message || "Sync complete", {
          id: toastId,
          description: [
            `DB: ${report.database}`,
            nav
              ? [
                  `Site menu — Services:${nav.servicesMenu}`,
                  `Materials:${nav.materialsMenu}`,
                  `Locations:${nav.locationsMenu ?? "—"}`,
                  `Gallery:${nav.galleryTotal ?? "—"}`,
                  `Guides:${nav.guidesTotal ?? "—"}`,
                  `Products:${nav.productsTotal ?? "—"}`,
                  `FAQ:${nav.faqsTotal ?? "—"}`,
                ].join(" · ")
              : null,
            localeRepair?.totalRepaired
              ? `Locales filled — home:${localeRepair.home?.repaired ?? 0} · products:${localeRepair.products?.repaired ?? 0} · categories:${localeRepair.categories?.repaired ?? 0} · gallery:${localeRepair.gallery?.repaired ?? 0} · faqs:${localeRepair.faqs?.repaired ?? 0} · guides:${localeRepair.blogs?.repaired ?? 0}`
              : null,
            blogSync?.created
              ? `Guides added:${blogSync.created}`
              : null,
            repaired &&
            (repaired.homeHubsRepaired > 0 || repaired.categoriesRepaired > 0)
              ? `Repaired probe/defaults — hubs:${repaired.homeHubsRepaired} · pages:${repaired.categoriesRepaired}`
              : null,
            addedParts.length
              ? `Added: ${addedParts.join(", ")}`
              : "Nothing missing",
            report.homeUpdated ? "Home sections refreshed" : "Home unchanged",
          ]
            .filter(Boolean)
            .join(" · "),
          duration: 8000,
        });
        emitCmsSynced({ site: "thailand-kitchen", report });
      }
      router.refresh();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Sync failed — check backend & database connection";
      toast.error(msg, { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-[#F4F5F7] text-[#1A1D26] flex h-screen overflow-hidden">
      <aside className="w-[240px] shrink-0 bg-white border-r border-[#E8EAED] flex flex-col h-full overflow-hidden">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-[#E8EAED] shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#1A2332] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-bold tracking-wide text-[15px]">TK & VD Admin Panel</span>
        </div>

        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto min-h-0">
          {!isVarsovia ? (
            <>
              <p className="px-3 pb-1 pt-1 text-[10px] font-bold tracking-[0.14em] uppercase text-[#9CA3AF]">
                Website pages
              </p>
              {THAILAND_NAV.filter((i) => i.group === "pages").map((item) => {
                const { href, label, icon: Icon } = item;
                return (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    onClick={(e) => openNavItem(e, item)}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive(item)
                        ? "bg-[#EEF0F3] text-[#1A2332]"
                        : "text-[#5C6370] hover:bg-[#F5F6F8] hover:text-[#1A2332]"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                    {label}
                  </Link>
                );
              })}
              <p className="px-3 pb-1 pt-4 text-[10px] font-bold tracking-[0.14em] uppercase text-[#9CA3AF]">
                Legal
              </p>
              {THAILAND_NAV.filter((i) => i.group === "chrome").map((item) => {
                const { href, label, icon: Icon } = item;
                return (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    onClick={(e) => openNavItem(e, item)}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive(item)
                        ? "bg-[#EEF0F3] text-[#1A2332]"
                        : "text-[#5C6370] hover:bg-[#F5F6F8] hover:text-[#1A2332]"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                    {label}
                  </Link>
                );
              })}
              <p className="px-3 pb-1 pt-4 text-[10px] font-bold tracking-[0.14em] uppercase text-[#9CA3AF]">
                Admin
              </p>
              {THAILAND_NAV.filter((i) => i.group === "admin").map((item) => {
                const { href, label, icon: Icon } = item;
                return (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive(item)
                        ? "bg-[#EEF0F3] text-[#1A2332]"
                        : "text-[#5C6370] hover:bg-[#F5F6F8] hover:text-[#1A2332]"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                    {label}
                  </Link>
                );
              })}
              
              {/* Sign Out button directly below Users */}
              <div className="pt-3 mt-3 border-t border-[#E8EAED]">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#DC2626] hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="px-3 pb-1 pt-1 text-[10px] font-bold tracking-[0.14em] uppercase text-[#9CA3AF]">
                Website pages
              </p>
              {VARSOVIA_NAV.filter((i) => i.group === "pages").map((item) => {
                const { href, label, icon: Icon } = item;
                return (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    onClick={(e) => openNavItem(e, item)}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive(item)
                        ? "bg-[#EEF0F3] text-[#1A2332]"
                        : "text-[#5C6370] hover:bg-[#F5F6F8] hover:text-[#1A2332]"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                    {label}
                  </Link>
                );
              })}
              <p className="px-3 pb-1 pt-4 text-[10px] font-bold tracking-[0.14em] uppercase text-[#9CA3AF]">
                Legal
              </p>
              {VARSOVIA_NAV.filter((i) => i.group === "chrome").map((item) => {
                const { href, label, icon: Icon } = item;
                return (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    onClick={(e) => openNavItem(e, item)}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive(item)
                        ? "bg-[#EEF0F3] text-[#1A2332]"
                        : "text-[#5C6370] hover:bg-[#F5F6F8] hover:text-[#1A2332]"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                    {label}
                  </Link>
                );
              })}
              <p className="px-3 pb-1 pt-4 text-[10px] font-bold tracking-[0.14em] uppercase text-[#9CA3AF]">
                Content
              </p>
              {VARSOVIA_NAV.filter((i) => i.group === "content").map((item) => {
                const { href, label, icon: Icon } = item;
                return (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    onClick={(e) => openNavItem(e, item)}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive(item)
                        ? "bg-[#EEF0F3] text-[#1A2332]"
                        : "text-[#5C6370] hover:bg-[#F5F6F8] hover:text-[#1A2332]"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                    {label}
                  </Link>
                );
              })}
              <p className="px-3 pb-1 pt-4 text-[10px] font-bold tracking-[0.14em] uppercase text-[#9CA3AF]">
                Site chrome
              </p>
              {VARSOVIA_NAV.filter((i) => i.group === "admin").map((item) => {
                const { href, label, icon: Icon } = item;
                return (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    onClick={(e) => openNavItem(e, item)}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive(item)
                        ? "bg-[#EEF0F3] text-[#1A2332]"
                        : "text-[#5C6370] hover:bg-[#F5F6F8] hover:text-[#1A2332]"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                    {label}
                  </Link>
                );
              })}
              
              {/* Sign Out button directly below Site chrome */}
              <div className="pt-3 mt-3 border-t border-[#E8EAED]">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#DC2626] hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-[#E8EAED] px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <h1 className="text-sm font-bold tracking-[0.12em] uppercase truncate">
              {title}
            </h1>
            <div className="relative">
              <select
                value={siteId}
                onChange={(e) => changeSite(e.target.value as SiteId)}
                className="appearance-none bg-[#F5F6F8] border border-[#E2E5EA] rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-[#1A2332] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1A2332]/20"
              >
                {SITES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openSyncConfirm}
              disabled={syncing}
              title="Sync from connected database (Journal articles mirrored to live set)"
              className={clsx(
                "inline-flex items-center gap-2 rounded-xl border border-[#E2E5EA] bg-white px-3 py-2 text-xs font-semibold text-[#1A2332] transition-colors",
                syncing
                  ? "opacity-70 cursor-wait"
                  : "hover:bg-[#F5F6F8] hover:border-[#CBD5E1]"
              )}
            >
              <RefreshCw
                className={clsx("w-3.5 h-3.5", syncing && "animate-spin")}
                strokeWidth={2}
              />
              {syncing ? "Syncing…" : "Sync from DB"}
            </button>

            <div className="relative shrink-0" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              className="relative w-9 h-9 rounded-full bg-[#1A2332] text-white flex items-center justify-center text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#1A2332]/25"
            >
              {user?.initials || "TH"}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-white" />
            </button>

            {profileOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+10px)] z-50 min-w-[240px] rounded-2xl bg-white px-5 py-4 shadow-[0_8px_28px_rgba(15,23,42,0.14)] border border-[#EEF0F3]"
              >
                <p className="text-[14px] text-[#4B5563] truncate">
                  {user?.email || "thailandkichens@gmail.com"}
                </p>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="mt-3 flex items-center gap-2 text-[14px] font-medium text-[#C2185B] hover:text-[#A9144D] transition-colors"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2} />
                  Sign Out
                </button>
              </div>
            ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-6 bg-[#F4F5F7] overflow-y-auto">
          <div key={pathname} className="tk-admin-panel-swap">
            {children}
          </div>
        </main>
      </div>

      {syncConfirmOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A2332]/45 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => !syncing && setSyncConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sync-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white shadow-[0_24px_64px_rgba(26,35,50,0.22)] border border-[#E8EAED] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF0F3] text-[#1A2332]">
                  <Database className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h2
                    id="sync-dialog-title"
                    className="text-[15px] font-bold text-[#1A2332] tracking-tight"
                  >
                    Sync from connected database?
                  </h2>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    {isVarsovia
                      ? "Uses the Varsovia API / database configured for this admin."
                      : "Uses the MongoDB your Thailand backend is connected to right now."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSyncConfirmOpen(false)}
                className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#F4F5F7] hover:text-[#1A2332] transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 pb-4">
              <ul className="space-y-2 rounded-xl border border-[#E8EDF2] bg-[#F8FAFC] px-4 py-3.5">
                {(isVarsovia
                  ? [
                      "Reloads Varsovia CMS into admin (same database as the live site)",
                      "Journal page: mirrors live /journal article set (upsert + delete extras)",
                      "Fills blank site fields from defaults (Journal hero, intro, explore…)",
                      "Other resources: counts reload from DB — no wipe of edited products/projects",
                    ]
                  : [
                      "Same MongoDB the public site uses — admin list reloads to match",
                      "Services, Materials, Locations, Gallery, Guides, Products & FAQ counts mirror the live site",
                      "Fills empty Thai/Polish fields from defaults and English copy where translations are missing",
                      "Auto-removes smoke-test probe strings and fills missing landing defaults",
                      "Never deletes real content — only repairs test markers & empty fields",
                    ]
                ).map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 text-[13px] text-[#334155] leading-snug"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1A2332]" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#EEF0F3] bg-[#FAFBFC] px-5 py-3.5">
              <button
                type="button"
                onClick={() => setSyncConfirmOpen(false)}
                className="rounded-xl border border-[#E2E5EA] bg-white px-4 py-2 text-sm font-semibold text-[#5C6370] hover:bg-[#F5F6F8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={runSyncFromDb}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1A2332] px-4 py-2 text-sm font-semibold text-white hover:bg-[#243044] transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                Sync now
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
