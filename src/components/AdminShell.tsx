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
  Star,
  BookOpen,
  BriefcaseBusiness,
  Handshake,
  MapPin,
  Settings,
  Inbox,
  Wrench,
} from "lucide-react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import type { SiteId } from "@/services/adminAPI";
import { clsx } from "clsx";
import {
  ADMIN_SECTION_EVENT,
  VARSOVIA_NAV_EVENT,
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
  group?: "pages" | "admin";
}[] = [
  // Same order as the public website navigation + pages
  { href: "/", label: "Home Page", icon: Home, group: "pages" },
  { href: "/products", label: "Products", icon: Package, group: "pages" },
  { href: "/categories", label: "Categories", icon: FolderKanban, group: "pages" },
  { href: "/gallery", label: "Gallery", icon: Images, group: "pages" },
  { href: "/blogs", label: "Blogs", icon: FileText, group: "pages" },
  { href: "/?section=catalogue", label: "Catalogue", icon: BookOpen, section: "catalogue", group: "pages" },
  { href: "/faqs", label: "FAQs", icon: MessageCircleQuestion, group: "pages" },
  { href: "/?section=contactPage", label: "Contact Page", icon: MapPin, section: "contactPage", group: "pages" },
  { href: "/privacy", label: "Privacy Policy", icon: Shield, group: "pages" },
  { href: "/terms", label: "Terms & Conditions", icon: ScrollText, group: "pages" },
  // Admin tools
  { href: "/contacts", label: "Contact Inbox", icon: Inbox, group: "admin" },
  { href: "/users", label: "Users", icon: Users, group: "admin" },
];

const VARSOVIA_NAV: {
  href: string;
  label: string;
  icon: typeof Home;
  resource?: string;
  section?: string;
  group: "pages" | "admin";
}[] = [
  // Same order as Varsovia public nav + home content sources
  { href: "/varsovia?resource=site", resource: "site", label: "Home Page", icon: Home, group: "pages" },
  { href: "/varsovia?resource=projects", resource: "projects", label: "Interior", icon: FolderKanban, group: "pages" },
  { href: "/varsovia?resource=catalogues", resource: "catalogues", label: "Free Catalogue", icon: BookOpen, group: "pages" },
  { href: "/varsovia?resource=showcases", resource: "showcases", label: "Showcase", icon: Images, group: "pages" },
  {
    href: "/varsovia?resource=site&section=aboutPage",
    resource: "site",
    section: "aboutPage",
    label: "About",
    icon: BookOpen,
    group: "pages",
  },
  { href: "/varsovia?resource=team-members", resource: "team-members", label: "Team", icon: BriefcaseBusiness, group: "pages" },
  { href: "/varsovia?resource=blogs", resource: "blogs", label: "Blog", icon: FileText, group: "pages" },
  {
    href: "/varsovia?resource=site&section=qualitySale",
    resource: "site",
    section: "qualitySale",
    label: "Quality After Sales",
    icon: Wrench,
    group: "pages",
  },
  { href: "/varsovia?resource=faqs", resource: "faqs", label: "FAQs", icon: MessageCircleQuestion, group: "pages" },
  {
    href: "/varsovia?resource=site&section=contact",
    resource: "site",
    section: "contact",
    label: "Contact",
    icon: MapPin,
    group: "pages",
  },
  { href: "/varsovia?resource=products", resource: "products", label: "Products", icon: Package, group: "pages" },
  { href: "/varsovia?resource=testimonials", resource: "testimonials", label: "Testimonials", icon: Star, group: "pages" },
  { href: "/varsovia?resource=partners", resource: "partners", label: "Partners", icon: Handshake, group: "pages" },
  { href: "/varsovia?resource=showrooms", resource: "showrooms", label: "Showrooms", icon: MapPin, group: "pages" },
  // Site chrome / admin tools
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

/** Home Site Settings sections — used so "Home Page" stays active while editing home blocks */
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
  }) => {
    if (item.resource) {
      if (pathname !== "/varsovia" || activeResource !== item.resource) {
        return false;
      }
      if (item.section) {
        return currentSection === item.section;
      }
      // Home Page: resource=site with no section, or a home section
      if (item.resource === "site") {
        return !currentSection || VARSOVIA_HOME_SECTIONS.has(currentSection);
      }
      return true;
    }
    if (item.section) {
      return pathname === "/" && homeSection === item.section;
    }
    if (item.href === "/") {
      return pathname === "/" && !homeSection;
    }
    const pathOnly = item.href.split("?")[0];
    return pathname.startsWith(pathOnly);
  };

  const openNavItem = (
    event: React.MouseEvent,
    item: { href: string; section?: string; resource?: string }
  ) => {
    // Varsovia: stay on /varsovia and swap resource/section without Next navigation
    if (isVarsovia && item.resource) {
      if (pathname.startsWith("/varsovia")) {
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

  const changeSite = (next: SiteId) => {
    setSiteId(next);
    router.push(
      next === "varsovia-kitchen" ? "/varsovia?resource=site" : "/"
    );
  };

  return (
    <div
      className={clsx(
        "bg-[#F4F5F7] text-[#1A1D26] flex",
        lockShellHeight
          ? "fixed inset-0 z-0 overflow-hidden"
          : "min-h-screen"
      )}
    >
      <aside
        className={clsx(
          "w-[240px] shrink-0 bg-white border-r border-[#E8EAED] flex flex-col",
          lockShellHeight && "h-full overflow-hidden"
        )}
      >
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-[#E8EAED]">
          <div className="w-8 h-8 rounded-full bg-[#1A2332] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-bold tracking-wide text-[15px]">TRUSTPRIME</span>
        </div>

        <nav
          className={clsx(
            "flex-1 px-3 py-4 space-y-1",
            lockShellHeight && "min-h-0 overflow-y-auto"
          )}
        >
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
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="m-3 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#E11D48] hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </aside>

      <div
        className={clsx(
          "flex-1 min-w-0 flex flex-col",
          lockShellHeight && "min-h-0 h-full overflow-hidden"
        )}
      >
        <header
          className={clsx(
            "h-16 bg-white border-b border-[#E8EAED] px-6 flex items-center justify-between gap-4",
            lockShellHeight && "shrink-0"
          )}
        >
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
        </header>

        <main
          className={clsx(
            "flex-1 p-5 lg:p-6",
            lockShellHeight ? "min-h-0 overflow-auto" : "overflow-auto"
          )}
        >
          <div key={pathname} className="tk-admin-panel-swap">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
