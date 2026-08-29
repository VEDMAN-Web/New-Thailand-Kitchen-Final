"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AdminSkeleton from "@/components/AdminSkeleton";
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
  Menu,
} from "lucide-react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import type { SiteId } from "@/services/adminAPI";
import { syncSiteFromDb } from "@/services/adminAPI";
import { syncVarsoviaFromDb } from "@/services/varsoviaAPI";
import {
  varsoviaHubKeyFromPath,
  IA_HUB_PATHS,
  isShowcaseAdminPath,
  isCatalogueAdminSection,
  isTeamAdminSection,
  isQualityAdminSection,
  isContactAdminSection,
  isFaqAdminSection,
  isFooterAdminSection,
  SHOWCASE_LIVE_PATH,
  CATALOGUE_LIVE_PATH,
  TEAM_LIVE_PATH,
  QUALITY_LIVE_PATH,
  CONTACT_LIVE_PATH,
  FAQ_LIVE_PATH,
  FOOTER_LIVE_PATH,
} from "@/app/varsovia/iaPagesDefaults";
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
    href: "/varsovia/showcase",
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
    href: "/varsovia/about-brand",
    label: "About",
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

  // Site chrome
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
  { href: "/contacts", label: "Contact Inbox", icon: Inbox, group: "admin" },
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
            <div className="min-h-dvh bg-[#F4F5F7] p-4 sm:p-8">
              <AdminSkeleton variant="panel" />
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
  const isVarsoviaRoute = pathname.startsWith("/varsovia");
  const isSharedAdmin = pathname === "/contacts" || pathname === "/users";
  const isVarsovia =
    isVarsoviaRoute || (isSharedAdmin && siteId === "varsovia-kitchen");
  const [profileOpen, setProfileOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pendingSiteRef = useRef<SiteId | null>(null);
  const [homeSection, setHomeSection] = useState<string | null>(null);
  const [varsoviaNav, setVarsoviaNav] = useState<VarsoviaNavDetail>(() =>
    readVarsoviaNavFromUrl()
  );
  const syncHubKey = isVarsovia ? varsoviaHubKeyFromPath(pathname) : undefined;
  const syncShowcase = isVarsovia && isShowcaseAdminPath(pathname);
  const syncCatalogue =
    isVarsovia &&
    isCatalogueAdminSection(varsoviaNav.section || searchParams.get("section"));
  const syncTeam =
    isVarsovia && isTeamAdminSection(varsoviaNav.section || searchParams.get("section"));
  const syncQuality =
    isVarsovia && isQualityAdminSection(varsoviaNav.section || searchParams.get("section"));
  const syncContact =
    isVarsovia && isContactAdminSection(varsoviaNav.section || searchParams.get("section"));
  const syncFaq =
    isVarsovia && isFaqAdminSection(varsoviaNav.section || searchParams.get("section"));
  const syncFooter =
    isVarsovia && isFooterAdminSection(varsoviaNav.section || searchParams.get("section"));
  const syncPagePath = syncHubKey
    ? IA_HUB_PATHS[syncHubKey]
    : syncShowcase
      ? SHOWCASE_LIVE_PATH
      : syncCatalogue
        ? CATALOGUE_LIVE_PATH
        : syncTeam
          ? TEAM_LIVE_PATH
          : syncQuality
            ? QUALITY_LIVE_PATH
            : syncContact
              ? CONTACT_LIVE_PATH
              : syncFaq
                ? FAQ_LIVE_PATH
                : syncFooter
                  ? FOOTER_LIVE_PATH
                  : "";

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
    const pending = pendingSiteRef.current;
    if (pending === "thailand-kitchen") {
      if (isVarsoviaRoute) return;
      pendingSiteRef.current = null;
      if (siteId !== "thailand-kitchen") setSiteId("thailand-kitchen");
      return;
    }
    if (pending === "varsovia-kitchen") {
      if (!isVarsoviaRoute) return;
      pendingSiteRef.current = null;
      if (siteId !== "varsovia-kitchen") setSiteId("varsovia-kitchen");
      return;
    }

    if (isVarsoviaRoute) {
      if (siteId !== "varsovia-kitchen") setSiteId("varsovia-kitchen");
      return;
    }
    if (isSharedAdmin || pathname === "/login") return;
    if (siteId !== "thailand-kitchen") setSiteId("thailand-kitchen");
  }, [isVarsoviaRoute, isSharedAdmin, pathname, siteId, setSiteId]);

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

  const searchKey = searchParams.toString();

  useEffect(() => {
    setNavOpen(false);
  }, [pathname, searchKey]);

  useEffect(() => {
    if (!navOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [navOpen]);

  const handleNavItem = (
    event: React.MouseEvent,
    item: { href: string; section?: string; resource?: string }
  ) => {
    openNavItem(event, item);
    setNavOpen(false);
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
    pendingSiteRef.current = next;
    setSiteId(next);
    if (next === "varsovia-kitchen") {
      if (!isVarsoviaRoute) router.push("/varsovia?resource=site");
      return;
    }
    if (isVarsoviaRoute || (isSharedAdmin && siteId === "varsovia-kitchen")) {
      router.push("/");
    }
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
        const replaceHubKey = syncHubKey;
        const res = await syncVarsoviaFromDb(replaceHubKey, {
          replaceShowcase: syncShowcase,
          replaceCatalogue: syncCatalogue,
          replaceTeam: syncTeam,
          replaceQuality: syncQuality,
          replaceContact: syncContact,
          replaceFaq: syncFaq,
          replaceFooter: syncFooter,
        });
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
            report.catalogueSync
              ? `Catalogues:${report.catalogueSync.total} (removed ${report.catalogueSync.deleted})`
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
    <div className="bg-[#F4F5F7] text-[#1A1D26] flex h-screen h-dvh max-h-dvh overflow-hidden overscroll-none">
      {navOpen ? (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-[80] bg-[#1A2332]/45"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
        />
      ) : null}
      <aside
        className={clsx(
          "bg-white border-r border-[#E8EAED] flex flex-col h-full overflow-hidden shrink-0",
          "fixed lg:static inset-y-0 left-0 z-[85] w-[min(280px,88vw)] lg:w-[240px]",
          "transition-transform duration-200 ease-out pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
          navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          !navOpen && "pointer-events-none lg:pointer-events-auto"
        )}
      >
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-[#E8EAED] shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#1A2332] flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-bold tracking-wide text-[15px] min-w-0 flex-1 truncate leading-tight">
            TK & VD Admin Panel
          </span>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            className="lg:hidden ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F5F6F8]"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
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
                    onClick={(e) => handleNavItem(e, item)}
                    className={clsx(
                      "flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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
                    onClick={(e) => handleNavItem(e, item)}
                    className={clsx(
                      "flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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
                    onClick={() => setNavOpen(false)}
                    className={clsx(
                      "flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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
                  onClick={() => {
                    setNavOpen(false);
                    logout();
                  }}
                  className="w-full flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#DC2626] hover:bg-red-50 transition-colors"
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
                    onClick={(e) => handleNavItem(e, item)}
                    className={clsx(
                      "flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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
                    onClick={(e) => handleNavItem(e, item)}
                    className={clsx(
                      "flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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
              {VARSOVIA_NAV.some((i) => i.group === "content") ? (
                <>
                  <p className="px-3 pb-1 pt-4 text-[10px] font-bold tracking-[0.14em] uppercase text-[#9CA3AF]">
                    Content
                  </p>
                  {VARSOVIA_NAV.filter((i) => i.group === "content").map((item) => {
                    const { href, label, icon: Icon } = item;
                    return (
                      <Link
                        key={`${href}-${label}`}
                        href={href}
                        onClick={(e) => handleNavItem(e, item)}
                        className={clsx(
                          "flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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
                </>
              ) : null}
              <p className="px-3 pb-1 pt-4 text-[10px] font-bold tracking-[0.14em] uppercase text-[#9CA3AF]">
                Site chrome
              </p>
              {VARSOVIA_NAV.filter((i) => i.group === "admin").map((item) => {
                const { href, label, icon: Icon } = item;
                return (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    onClick={(e) => handleNavItem(e, item)}
                    className={clsx(
                      "flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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
                  onClick={() => {
                    setNavOpen(false);
                    logout();
                  }}
                  className="w-full flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#DC2626] hover:bg-red-50 transition-colors"
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
        <header className="min-h-16 bg-white border-b border-[#E8EAED] px-3 sm:px-4 lg:px-6 py-2 lg:py-0 flex items-center justify-between gap-2 sm:gap-4 shrink-0 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="lg:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#1A2332] hover:bg-[#F5F6F8]"
              aria-label="Open navigation"
              aria-expanded={navOpen}
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
            <h1 className="text-xs sm:text-sm font-bold tracking-[0.12em] uppercase truncate min-w-0 flex-1">
              {title}
            </h1>
            <div className="relative shrink-0">
              <select
                value={siteId}
                onChange={(e) => changeSite(e.target.value as SiteId)}
                className="appearance-none bg-[#F5F6F8] border border-[#E2E5EA] rounded-lg pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-2 text-xs sm:text-sm font-medium text-[#1A2332] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1A2332]/20 max-w-[110px] sm:max-w-[180px] truncate"
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
              aria-label={syncing ? "Syncing from database" : "Sync from DB"}
              title={
                syncPagePath
                  ? `Overwrite this page from live ${syncPagePath} (photos + copy)`
                  : "Overwrite admin from the live site — all pages, photos, and copy"
              }
              className={clsx(
                "inline-flex items-center gap-2 rounded-xl border border-[#E2E5EA] bg-white px-2.5 sm:px-3 py-2 text-xs font-semibold text-[#1A2332] transition-colors",
                syncing
                  ? "opacity-70 cursor-wait"
                  : "hover:bg-[#F5F6F8] hover:border-[#CBD5E1]"
              )}
            >
              <RefreshCw
                className={clsx("w-3.5 h-3.5", syncing && "animate-spin")}
                strokeWidth={2}
              />
              <span className="hidden sm:inline">{syncing ? "Syncing…" : "Sync from DB"}</span>
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
                className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(240px,calc(100vw-24px))] rounded-2xl bg-white px-5 py-4 shadow-[0_8px_28px_rgba(15,23,42,0.14)] border border-[#EEF0F3]"
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

        <main className="min-h-0 flex-1 p-3 sm:p-5 lg:p-6 bg-[#F4F5F7] overflow-y-auto overflow-x-hidden min-w-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div key={pathname} className="tk-admin-panel-swap">
            {children}
          </div>
        </main>
      </div>

      {syncConfirmOpen ? (
        <div
          className="tk-overlay z-[100] bg-[#1A2332]/45 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => !syncing && setSyncConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sync-dialog-title"
            className="tk-sheet flex w-full max-w-md flex-col overflow-hidden bg-white shadow-[0_24px_64px_rgba(26,35,50,0.22)] border border-[#E8EAED]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 px-4 sm:px-5 pt-5 pb-3">
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

            <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-5 pb-4">
              <ul className="space-y-2 rounded-xl border border-[#E8EDF2] bg-[#F8FAFC] px-4 py-3.5">
                    {(isVarsovia
                      ? [
                          "Overwrites the admin panel with the live site — photos, banners, and copy across all Varsovia pages",
                          "Blank or missing fields take the live values. Unsaved panel edits that differ from live are discarded",
                          "Journal articles: mirrors live /journal set (upsert + delete extras)",
                          syncShowcase
                            ? "Showcase cards: fill every listing + detail field (cover, title, category, location, type, supply area, gallery) in EN / TH / PL"
                            : syncCatalogue
                              ? "Brochures: the 6 live /catalogue cards (title, cover, PDF) in EN / TH / PL — extras removed"
                              : syncTeam
                                ? "Team members: fill name and role in EN / TH / PL — photos kept"
                                : syncContact
                                  ? "Showrooms: fill name and location in EN / TH / PL — photos kept"
                                  : syncFaq
                                    ? "FAQ Q&A: add and delete match live /faq — Sync fills translations, does not restore deleted questions"
                                    : "Interior projects and other resources: photos and language tabs reload to match live",
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

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#EEF0F3] bg-[#FAFBFC] px-4 sm:px-5 py-3.5 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
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
