"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "../i18n/LanguageProvider";
import type { Locale } from "../i18n/translations";
import {
  loadNavSearchIndex,
  searchSiteGrouped,
  type NavSearchResult,
} from "./navSearch";
import ConsultationEnquiryModal from "./ConsultationEnquiryModal";
import { useCmsSection } from "../lib/CmsHomeContext";
import { pickCmsText } from "../lib/cmsText";
import {
  HubDesktopNavItem,
  HubMobileNavSection,
  hubNavByHref,
} from "../components/navigation/HubMegaMenu";

const languages = [
  { code: "EN" as const, label: "English", flag: "/en.png" },
  { code: "TH" as const, label: "ไทย", flag: "/thai.svg" },
  { code: "PL" as const, label: "Polski", flag: "/poland.svg" },
];

const defaultNavLinks = [
  { href: "/", labelKey: "nav.home" as const },
  { href: "/kitchens", labelKey: "nav.kitchens" as const },
  { href: "/products", labelKey: "nav.products" as const },
  { href: "/services", labelKey: "nav.services" as const },
  { href: "/materials", labelKey: "nav.materials" as const },
  { href: "/locations", labelKey: "nav.locations" as const },
  { href: "/gallery", labelKey: "nav.gallery" as const },
  { href: "/guides", labelKey: "nav.guides" as const },
  { href: "/contact", labelKey: "nav.contact" as const },
  { href: "/faq", labelKey: "nav.faq" as const },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useTranslation();
  const navCms = useCmsSection<{
    logoUrl?: string;
    links?: { label?: string; href?: string }[];
    consultationLabel?: string;
    searchPlaceholder?: string;
  }>("nav");
  const [isOpen, setIsOpen] = useState(false);
  const [searchHover, setSearchHover] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState<NavSearchResult[] | null>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchExpanded = searchHover || searchFocused || search.trim().length > 0;
  const showSearchResults = searchFocused || search.trim().length > 0;

  const selectedLanguage =
    languages.find((l) => l.code === locale) ?? languages[0];

  const cmsLinks = (navCms?.links || []).filter(
    (l) => l?.href && pickCmsText(l?.label, "", "EN")
  );
  const navLinks = useMemo(() => {
    const raw =
      cmsLinks.length > 0
        ? cmsLinks.map((l) => {
            const href = String(l.href || "/").replace(/\/+$/, "") || "/";
            const fallback = defaultNavLinks.find((d) => d.href === href);
            return {
              href,
              label: pickCmsText(
                l.label,
                fallback ? t(fallback.labelKey) : "",
                locale
              ),
            };
          })
        : defaultNavLinks.map((l) => ({
            href: l.href,
            label: t(l.labelKey),
          }));

    const seen = new Set<string>();
    return raw.filter((link) => {
      const key = link.href === "/blog" ? "/guides" : link.href;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [cmsLinks, locale, t]);
  const consultationLabel = pickCmsText(
    navCms?.consultationLabel,
    t("nav.consultation"),
    locale
  );
  const searchPlaceholder = pickCmsText(
    navCms?.searchPlaceholder,
    t("nav.search"),
    locale
  );
  const logoSrc =
    typeof navCms?.logoUrl === "string" && navCms.logoUrl.trim()
      ? navCms.logoUrl.trim()
      : "/logo1.svg";

  useEffect(() => {
    let alive = true;
    loadNavSearchIndex(locale).then((index) => {
      if (alive) setSearchIndex(index);
    });
    return () => {
      alive = false;
    };
  }, [locale]);

  const groupedResults = useMemo(
    () => searchSiteGrouped(search, searchIndex || undefined),
    [search, searchIndex],
  );
  const hasQuery = search.trim().length > 0;
  const resultCount = groupedResults.pages.length + groupedResults.content.length;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navLinkClass = (href: string) =>
    `shrink-0 rounded-full tracking-wide transition-colors duration-200 px-2 py-1.5 text-[12px] xl:px-2.5 xl:text-[13px] 2xl:px-3.5 2xl:py-2 2xl:text-sm ${
      isActive(href)
        ? "bg-[#F5F3EF] text-[#1A1A1A] font-bold"
        : "text-gray-500 font-medium hover:text-[#1A1A1A]"
    }`;

  const hubNavForHref = (href: string) => {
    const normalized = href.replace(/\/+$/, "") || "/";
    return hubNavByHref(normalized);
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setIsOpen(false);
    setSearchHover(false);
    setSearchFocused(false);
    setSearch("");
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (desktopSearchRef.current?.contains(target)) return;
      searchInputRef.current?.blur();
      setSearchFocused(false);
      setSearchHover(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const openSearch = () => {
    setIsOpen(false);
    setSearchHover(true);
    setSearchFocused(true);
    window.setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const selectLanguage = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  const goToResult = (href: string) => {
    setSearch("");
    setSearchHover(false);
    setSearchFocused(false);
    setMobileOpen(false);

    // Same page: do not scroll / move sections
    if (href === pathname) return;

    router.push(href);
  };

  const SearchResultsList = ({ mobile = false }: { mobile?: boolean }) => {
    if (!hasQuery) return null;

    const panelClass = mobile
      ? "mt-2 rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden"
      : "absolute right-0 top-[calc(100%+0.5rem)] z-[70] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-black/5 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.12)] overflow-hidden";

    if (!searchIndex) {
      return (
        <div className={`${panelClass} p-4`}>
          <p className="text-sm text-gray-500">{t("nav.searchLoading")}</p>
        </div>
      );
    }

    if (resultCount === 0) {
      return (
        <div className={`${panelClass} p-4`}>
          <p className="text-sm text-gray-500">{t("nav.noResults")}</p>
        </div>
      );
    }

    const renderRow = (item: NavSearchResult) => (
      <li key={item.id}>
        <button
          type="button"
          onClick={() => goToResult(item.href)}
          className="w-full px-4 py-3 text-left transition hover:bg-[#F5F3EF]"
        >
          <p className="text-sm font-semibold leading-snug text-[#1A1A1A] line-clamp-1">
            {item.title}
          </p>
          {item.description ? (
            <p className="mt-1 text-xs leading-5 text-gray-500 line-clamp-2">
              {item.description}
            </p>
          ) : null}
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E0905A]">
            {item.type}
          </p>
        </button>
      </li>
    );

    return (
      <div className={panelClass}>
        <div className="max-h-80 overflow-y-auto py-1">
          {groupedResults.pages.length > 0 ? (
            <div className="border-b border-black/5 pb-1 mb-1">
              <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                {t("nav.searchPages")}
              </p>
              <ul>{groupedResults.pages.map(renderRow)}</ul>
            </div>
          ) : null}
          {groupedResults.content.length > 0 ? (
            <div>
              <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                {t("nav.searchContent")}
              </p>
              <ul>{groupedResults.content.map(renderRow)}</ul>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-visible">
      <div className="w-full px-4 sm:px-6 xl:px-8 2xl:px-10 py-3">
        <div className="flex items-center justify-between gap-2 xl:gap-3 2xl:gap-4">
          <Link
            href="/"
            className="flex-shrink-0"
            onClick={() => setMobileOpen(false)}
          >
            <Image
              src={logoSrc}
              alt="Thailand Kitchens"
              width={200}
              height={72}
              priority
              className="w-auto h-11 sm:h-12 xl:h-12 2xl:h-14"
            />
          </Link>

          <nav className="hidden lg:flex flex-1 min-w-0 justify-center overflow-visible">
            <div className="flex items-center justify-center flex-nowrap bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] px-1.5 py-1 xl:px-2 xl:py-1.5 gap-0 max-w-full overflow-visible">
              {navLinks.map((link) => {
                const href = link.href === "/blog" ? "/guides" : link.href;
                const hubConfig = hubNavForHref(href);
                if (hubConfig) {
                  return (
                    <HubDesktopNavItem
                      key={link.href}
                      config={hubConfig}
                      label={link.label}
                      locale={locale}
                      pathname={pathname}
                      linkClassName={navLinkClass(hubConfig.href)}
                    />
                  );
                }
                return (
                  <Link key={link.href} href={href} className={navLinkClass(href)}>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="relative hidden h-10 w-10 shrink-0 sm:block"
              ref={desktopSearchRef}
              onMouseEnter={() => {
                setIsOpen(false);
                setSearchHover(true);
              }}
              onMouseLeave={() => {
                if (!searchFocused && !search.trim()) setSearchHover(false);
              }}
            >
              {/* Fixed icon slot — bar expands left as overlay so nav never reflows */}
              <div
                className={`absolute right-0 top-1/2 z-[60] flex -translate-y-1/2 items-center overflow-hidden rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  searchExpanded
                    ? "h-10 w-[min(234px,calc(100vw-8rem))] gap-1 border border-[#D4C4B0] bg-[#F5F3EF] pl-4 pr-1 shadow-[0_8px_22px_rgba(0,0,0,0.10)]"
                    : "h-10 w-10 justify-center border border-transparent bg-transparent shadow-none"
                }`}
              >
                <input
                  ref={searchInputRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => {
                    setIsOpen(false);
                    setSearchFocused(true);
                    setSearchHover(true);
                  }}
                  onBlur={(e) => {
                    const next = e.relatedTarget as Node | null;
                    if (next && desktopSearchRef.current?.contains(next)) return;
                    requestAnimationFrame(() => {
                      const active = document.activeElement;
                      if (active && desktopSearchRef.current?.contains(active)) return;
                      setSearchFocused(false);
                      if (!search.trim()) setSearchHover(false);
                    });
                  }}
                  placeholder={searchPlaceholder}
                  tabIndex={searchExpanded ? 0 : -1}
                  aria-label={searchPlaceholder}
                  className={`min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-[#1A1A1A] caret-[#1A1A1A] outline-none transition-opacity duration-200 placeholder:text-gray-400 ${
                    searchExpanded
                      ? "pointer-events-auto opacity-100 delay-100"
                      : "pointer-events-none opacity-0"
                  }`}
                />
                <button
                  type="button"
                  onClick={openSearch}
                  aria-label="Search"
                  aria-expanded={searchExpanded}
                  className={`flex shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                    searchExpanded
                      ? "h-8 w-8 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                      : "h-10 w-10 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                  }`}
                >
                  <Image
                    src="/Search.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="block object-contain"
                  />
                </button>
              </div>

              {showSearchResults ? <SearchResultsList /> : null}
            </div>

            <div className="relative hidden sm:flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2.5 bg-white hover:bg-gray-50 text-[#1A1A1A] px-4 lg:px-5 py-2.5 rounded-full font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition text-xs sm:text-sm whitespace-nowrap h-[42px]"
              >
                <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[#F5F3EF] ring-1 ring-black/5">
                  <Image
                    src={selectedLanguage.flag}
                    alt={selectedLanguage.label}
                    width={18}
                    height={18}
                    className="rounded-full object-cover"
                  />
                </span>
                <span className="tracking-normal">{selectedLanguage.label}</span>
                <Image
                  src="/Arrow-down.png"
                  alt=""
                  width={10}
                  height={10}
                  className={`${isOpen ? "rotate-180" : ""} shrink-0 opacity-70 transition-transform`}
                />
              </button>

              {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-black/5 overflow-hidden z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => selectLanguage(language.code)}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition ${
                        locale === language.code
                          ? "font-semibold text-[#1A1A1A]"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[#F5F3EF] ring-1 ring-black/5">
                        <Image
                          src={language.flag}
                          alt={language.label}
                          width={18}
                          height={18}
                          className="rounded-full object-cover"
                        />
                      </span>
                      <span>{language.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setEnquiryOpen(true)}
              className="hidden sm:inline-flex items-center bg-white hover:bg-gray-50 text-[#1A1A1A] px-4 lg:px-5 py-2.5 rounded-full font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition text-xs sm:text-sm whitespace-nowrap h-[42px]"
            >
              {consultationLabel}
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileOpen((open) => !open);
                setIsOpen(false);
                setSearchHover(false);
                setSearchFocused(false);
              }}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition"
            >
              <div className="flex flex-col justify-center gap-1.5 w-5">
                <span
                  className={`block h-0.5 w-5 bg-[#1A1A1A] transition-transform duration-300 ${
                    mobileOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-[#1A1A1A] transition-opacity duration-300 ${
                    mobileOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-[#1A1A1A] transition-transform duration-300 ${
                    mobileOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden absolute inset-x-0 top-full z-50 bg-white border-b border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen
            ? "max-h-[min(80vh,640px)] opacity-100 pointer-events-auto visible"
            : "max-h-0 opacity-0 pointer-events-none invisible"
        }`}
      >
        <nav className="flex flex-col px-4 sm:px-6 py-4 gap-1 overflow-y-auto max-h-[min(80vh,640px)]">
          {navLinks.map((link) => {
            const href = link.href === "/blog" ? "/guides" : link.href;
            const hubConfig = hubNavForHref(href);
            if (hubConfig) {
              return (
                <HubMobileNavSection
                  key={link.href}
                  config={hubConfig}
                  label={link.label}
                  locale={locale}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              );
            }
            return (
              <Link
                key={link.href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`py-3 px-4 rounded-full font-medium transition ${
                  isActive(href)
                    ? "text-[#1A1A1A] font-bold bg-[#F5F3EF]"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="sm:hidden pt-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-full border border-[#D4C4B0] bg-[#F5F3EF] px-4 py-2.5 text-sm text-[#1A1A1A] caret-[#1A1A1A] placeholder:text-gray-400 outline-none shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
            />
            <SearchResultsList mobile />
          </div>

          <div className="sm:hidden flex flex-wrap gap-2 pt-2">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => {
                  selectLanguage(language.code);
                  setMobileOpen(false);
                }}
                className={`flex flex-1 min-w-[30%] items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold border transition bg-white ${
                  locale === language.code
                    ? "border-[#B38B6D] text-[#1A1A1A] shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                <Image
                  src={language.flag}
                  alt={language.label}
                  width={22}
                  height={16}
                  className="rounded-sm object-cover"
                />
                {language.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setEnquiryOpen(true);
            }}
            className="sm:hidden mt-2 bg-[#1A1A1A] text-white px-5 py-3 rounded-full font-semibold text-center"
          >
            {consultationLabel}
          </button>
        </nav>
      </div>
      </header>
      <ConsultationEnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
      />
    </>
  );
};

export default Navbar;
