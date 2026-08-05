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
} from "lucide-react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import type { SiteId } from "@/services/adminAPI";
import { clsx } from "clsx";

const THAILAND_NAV = [
  { href: "/", label: "Home Page", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/blogs", label: "Blogs", icon: FileText },
  { href: "/privacy", label: "Privacy Policy", icon: Shield },
  { href: "/terms", label: "Terms & Conditions", icon: ScrollText },
  { href: "/users", label: "Users", icon: Users },
];

const VARSOVIA_NAV = [
  { href: "/varsovia?resource=site", resource: "site", label: "Site Settings", icon: Settings },
  { href: "/varsovia?resource=products", resource: "products", label: "Products", icon: Package },
  { href: "/varsovia?resource=projects", resource: "projects", label: "Interior Projects", icon: FolderKanban },
  { href: "/varsovia?resource=blogs", resource: "blogs", label: "Blogs", icon: FileText },
  { href: "/varsovia?resource=faqs", resource: "faqs", label: "FAQs", icon: MessageCircleQuestion },
  { href: "/varsovia?resource=testimonials", resource: "testimonials", label: "Testimonials", icon: Star },
  { href: "/varsovia?resource=catalogues", resource: "catalogues", label: "Catalogues", icon: BookOpen },
  { href: "/varsovia?resource=showcases", resource: "showcases", label: "Showcases", icon: Images },
  { href: "/varsovia?resource=team-members", resource: "team-members", label: "Team", icon: BriefcaseBusiness },
  { href: "/varsovia?resource=partners", resource: "partners", label: "Partners", icon: Handshake },
  { href: "/varsovia?resource=showrooms", resource: "showrooms", label: "Showrooms", icon: MapPin },
];

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
  const nav = isVarsovia ? VARSOVIA_NAV : THAILAND_NAV;
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  /** Unknown resources fall back to Site Settings, matching the Varsovia page. */
  const requestedResource = searchParams.get("resource") || "site";
  const activeResource = VARSOVIA_NAV.some(
    (item) => item.resource === requestedResource
  )
    ? requestedResource
    : "site";

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

  const isActive = (item: { href: string; resource?: string }) => {
    if (item.resource) {
      return pathname === "/varsovia" && activeResource === item.resource;
    }
    return item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href);
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
          {nav.map((item) => {
            const { href, label, icon: Icon } = item;
            return (
            <Link
              key={href}
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
          {children}
        </main>
      </div>
    </div>
  );
}
