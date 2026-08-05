"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "../i18n/LanguageProvider";
import type { Locale } from "../i18n/translations";
import { searchSiteContent } from "./navSearch";
import ConsultationEnquiryModal from "./ConsultationEnquiryModal";

const languages = [
  { code: "EN" as const, label: "English", flag: "/en.png" },
  { code: "TH" as const, label: "ไทย", flag: "/thai.svg" },
  { code: "PL" as const, label: "Polski", flag: "/poland.svg" },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const closeSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedLanguage =
    languages.find((l) => l.code === locale) ?? languages[0];

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
    { href: "/gallery", label: t("nav.gallery") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/faq", label: t("nav.faq") },
  ];

  const searchResults = useMemo(() => searchSiteContent(search, 8), [search]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    return () => {
      if (closeSearchTimer.current) clearTimeout(closeSearchTimer.current);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setIsOpen(false);
    setSearchOpen(false);
    setSearch("");
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [searchOpen]);

  const openSearch = () => {
    if (closeSearchTimer.current) {
      clearTimeout(closeSearchTimer.current);
      closeSearchTimer.current = null;
    }
    setIsOpen(false);
    setSearchOpen(true);
  };

  useEffect(() => {
    if (!searchOpen) return;
    const id = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [searchOpen]);

  const closeSearchOnLeave = () => {
    if (closeSearchTimer.current) clearTimeout(closeSearchTimer.current);
    closeSearchTimer.current = setTimeout(() => {
      searchInputRef.current?.blur();
      setSearchOpen(false);
      setSearch("");
    }, 100);
  };

  const toggleSearch = () => {
    if (searchOpen) {
      searchInputRef.current?.blur();
      setSearchOpen(false);
      setSearch("");
      return;
    }
    openSearch();
  };

  const selectLanguage = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  const goToResult = (href: string) => {
    setSearch("");
    setSearchOpen(false);
    setMobileOpen(false);

    // Same page: do not scroll / move sections
    if (href === pathname) return;

    router.push(href);
  };

  const SearchResultsList = ({ mobile = false }: { mobile?: boolean }) => {
    if (!search.trim()) return null;

    if (searchResults.length === 0) {
      return (
        <div
          className={`${
            mobile
              ? "mt-2 rounded-2xl border border-black/5 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
              : "absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-black/5 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] z-50"
          }`}
        >
          <p className="text-sm text-gray-500">No results found</p>
        </div>
      );
    }

    return (
      <div
        className={`${
          mobile
            ? "mt-2 rounded-2xl border border-black/5 bg-white overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
            : "absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] z-50 overflow-hidden"
        }`}
      >
        <ul className="max-h-80 overflow-y-auto py-1">
          {searchResults.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => goToResult(item.href)}
                className="w-full text-left px-4 py-3 hover:bg-[#F5F3EF] transition"
              >
                <p className="text-[10px] tracking-[0.16em] uppercase text-[#E0905A] font-semibold mb-1">
                  {item.type}
                </p>
                <p className="text-sm font-semibold text-[#1A1A1A] leading-snug line-clamp-1">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-gray-500 leading-5 line-clamp-2">
                  {item.description}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      <div className="w-full px-6 sm:px-8 lg:px-10 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex-shrink-0"
            onClick={() => setMobileOpen(false)}
          >
            <Image
              src="/logo1.png"
              alt="Thailand Kitchens"
              width={200}
              height={72}
              priority
              className="w-auto h-12 sm:h-14"
            />
          </Link>

          <nav className="hidden lg:flex items-center bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] px-3 py-1.5 gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm tracking-wide transition-colors duration-200 ${
                  isActive(link.href)
                    ? "bg-[#F5F3EF] text-[#1A1A1A] font-bold"
                    : "text-gray-500 font-medium hover:text-[#1A1A1A]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`relative hidden sm:block shrink-0 ${
                searchOpen ? "w-[15.5rem] h-10" : "w-10 h-10"
              }`}
              ref={desktopSearchRef}
              onMouseEnter={openSearch}
              onMouseLeave={(e) => {
                const next = e.relatedTarget as Node | null;
                if (next && desktopSearchRef.current?.contains(next)) return;
                closeSearchOnLeave();
              }}
            >
              <div
                className={`absolute right-0 top-1/2 z-50 flex h-10 -translate-y-1/2 items-center transition-all duration-300 ease-out ${
                  searchOpen
                    ? "w-[15.5rem] gap-2 rounded-full border border-[#D4C4B0] bg-[#F5F3EF] pl-4 pr-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                    : "w-10 justify-center"
                }`}
              >
                {searchOpen ? (
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={openSearch}
                    placeholder={t("nav.search")}
                    className="h-full min-w-0 flex-1 bg-transparent border-0 text-sm text-[#1A1A1A] caret-[#1A1A1A] placeholder:text-gray-400 outline-none"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={toggleSearch}
                  aria-label="Toggle search"
                  className={`shrink-0 flex items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:bg-gray-50 transition ${
                    searchOpen ? "w-8 h-8" : "w-10 h-10"
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

              {searchOpen ? <SearchResultsList /> : null}
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
              {t("nav.consultation")}
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileOpen((open) => !open);
                setIsOpen(false);
                setSearchOpen(false);
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`py-3 px-4 rounded-full font-medium transition ${
                isActive(link.href)
                  ? "text-[#1A1A1A] font-bold bg-[#F5F3EF]"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="sm:hidden pt-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("nav.search")}
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
            {t("nav.consultation")}
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
