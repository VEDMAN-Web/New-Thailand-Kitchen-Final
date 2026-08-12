"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCms } from "../../lib/CmsHomeContext";
import { pickCmsText } from "../../lib/cmsText";
import { categoryPublicPath } from "../../lib/categoryRoutes";
import type { CmsCategory } from "../../services/cmsPublic";
import type { Locale } from "../../i18n/translations";
import { useTranslation } from "../../i18n/LanguageProvider";
import {
  hubNavActive,
  type HubNavConfig,
  type HubPageCms,
} from "../../lib/hubNavigation";
import { KITCHENS_SECTIONS } from "../kitchens/kitchensConfig";

/** Delay before close — forgiving for diagonal mouse travel (Varsovia / Google-style). */
const HOVER_CLOSE_MS = 220;
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

function isTopLevelCategory(c: CmsCategory) {
  if (!c.parentId) return true;
  if (typeof c.parentId === "object") return false;
  return !String(c.parentId).trim();
}

function useHubCopy(config: HubNavConfig, locale: Locale) {
  const hubPages = useCms().sections?.hubPages as
    | Record<string, HubPageCms>
    | undefined;
  const hub = hubPages?.[config.key];
  return {
    title: pickCmsText(hub?.title, config.fallbackTitle, locale),
  };
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="opacity-55 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CategoryLink({
  item,
  locale,
  onNavigate,
}: {
  item: CmsCategory;
  locale: Locale;
  onNavigate?: () => void;
}) {
  const title = pickCmsText(item.title, item.slug || "", locale);
  const href = categoryPublicPath(item);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group/link relative flex items-center rounded-lg px-2.5 py-2 text-[13px] leading-snug text-[#5C6370] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#F7F4EF] hover:text-[#1A2332] hover:pl-3.5"
    >
      <span
        className="absolute left-1.5 top-1/2 h-0 w-0.5 -translate-y-1/2 rounded-full bg-[#B38B6D] opacity-0 transition-all duration-200 group-hover/link:h-3.5 group-hover/link:opacity-100"
        aria-hidden
      />
      <span className="truncate">{title}</span>
    </Link>
  );
}

function KitchensMegaPanel({
  categories,
  locale,
  overviewLabel,
  title,
  exploreLabel,
  onNavigate,
}: {
  categories: CmsCategory[];
  locale: Locale;
  overviewLabel: string;
  title: string;
  exploreLabel: string;
  onNavigate?: () => void;
}) {
  const hubPages = useCms().sections?.hubPages as
    | { kitchens?: HubPageCms }
    | undefined;

  const groups = KITCHENS_SECTIONS.map((section) => {
    const items = categories.filter(
      (c) =>
        String(c.categoryType) === section.categoryType &&
        c.slug &&
        isTopLevelCategory(c)
    );
    const sub = hubPages?.kitchens?.subsections?.[section.key];
    return {
      section,
      items,
      label: pickCmsText(sub?.title, section.label, locale),
    };
  });

  return (
    <div className="p-2.5 sm:p-3">
      <Link
        href="/kitchens"
        onClick={onNavigate}
        className="mb-2.5 flex items-center justify-between gap-3 rounded-xl bg-[#F7F4EF] px-3.5 py-2.5 transition-colors duration-200 hover:bg-[#F0EBE3]"
      >
        <span className="text-[13px] font-semibold text-[#1A2332]">
          {overviewLabel}
          <span className="mx-1.5 font-normal text-[#C4B8A8]">·</span>
          <span className="font-medium text-[#B38B6D]">{title}</span>
        </span>
        <span className="text-[11px] font-medium text-[#9CA3AF] tracking-wide">
          {exploreLabel} →
        </span>
      </Link>

      <div className="grid grid-cols-3 gap-1">
        {groups.map(({ section, items, label }) => (
          <div
            key={section.key}
            className="min-w-0 rounded-xl px-1 py-1 transition-colors duration-200 hover:bg-[#FAF8F5]/80"
          >
            <Link
              href={section.href}
              onClick={onNavigate}
              className="mb-1 block rounded-lg px-2.5 py-2 transition-colors duration-200 hover:bg-[#F7F4EF]"
            >
              <span
                className="text-[9px] uppercase tracking-[0.16em] font-semibold"
                style={{ color: section.accent }}
              >
                {section.shortLabel}
              </span>
              <span className="mt-0.5 block text-[13px] font-semibold text-[#1A2332] truncate">
                {label}
              </span>
            </Link>
            <div className="max-h-44 overflow-y-auto tk-no-scrollbar space-y-0.5 px-0.5">
              {items.length === 0 ? (
                <p className="text-[11px] text-[#C4B8A8] px-2.5 py-1.5">—</p>
              ) : (
                items.map((item) => (
                  <CategoryLink
                    key={item.id}
                    item={item}
                    locale={locale}
                    onNavigate={onNavigate}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlatMegaPanel({
  config,
  categories,
  locale,
  overviewLabel,
  title,
  exploreLabel,
  onNavigate,
}: {
  config: HubNavConfig;
  categories: CmsCategory[];
  locale: Locale;
  overviewLabel: string;
  title: string;
  exploreLabel: string;
  onNavigate?: () => void;
}) {
  const items = categories.filter(
    (c) =>
      config.categoryTypes.includes(String(c.categoryType || "")) &&
      c.slug &&
      isTopLevelCategory(c)
  );

  return (
    <div className="p-2.5 sm:p-3 min-w-[15rem]">
      <Link
        href={config.href}
        onClick={onNavigate}
        className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-[#F7F4EF] px-3.5 py-2.5 transition-colors duration-200 hover:bg-[#F0EBE3]"
      >
        <span>
          <span
            className="text-[9px] uppercase tracking-[0.16em] font-semibold block mb-0.5"
            style={{ color: config.accent }}
          >
            {overviewLabel}
          </span>
          <span className="text-[14px] font-semibold text-[#1A2332]">
            {title}
          </span>
        </span>
        <span className="text-[11px] font-medium text-[#9CA3AF] shrink-0">
          {exploreLabel} →
        </span>
      </Link>

      <div className="max-h-60 overflow-y-auto tk-no-scrollbar">
        {items.length === 0 ? (
          <p className="text-[12px] text-[#9CA3AF] px-3 py-4 text-center">
            No pages yet
          </p>
        ) : (
          <div
            className={
              items.length > 3
                ? "grid grid-cols-2 gap-x-1 gap-y-0.5"
                : "grid grid-cols-1 gap-0.5"
            }
          >
            {items.map((item) => (
              <CategoryLink
                key={item.id}
                item={item}
                locale={locale}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function HubDesktopNavItem({
  config,
  label,
  locale,
  pathname,
  linkClassName,
}: {
  config: HubNavConfig;
  label: string;
  locale: Locale;
  pathname: string;
  linkClassName: string;
}) {
  const { categories } = useCms();
  const { t } = useTranslation();
  const copy = useHubCopy(config, locale);
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overviewLabel = t("nav.overview");
  const exploreLabel = t("nav.explore");

  const filtered = useMemo(
    () =>
      categories.filter((c) =>
        config.categoryTypes.includes(String(c.categoryType || ""))
      ),
    [categories, config.categoryTypes]
  );

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
  }, [clearCloseTimer]);

  const handleEnter = useCallback(() => {
    clearCloseTimer();
    setRendered(true);
    // Next frame so CSS can animate from closed → open
    requestAnimationFrame(() => setOpen(true));
  }, [clearCloseTimer]);

  const handleLeave = useCallback(
    (e: React.MouseEvent) => {
      const next = e.relatedTarget;
      const root = rootRef.current;
      if (next instanceof Node && root && root.contains(next)) return;
      scheduleClose();
    },
    [scheduleClose]
  );

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const root = rootRef.current;
      const target = e.target;
      if (!root || !(target instanceof Node) || !root.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Keep panel mounted briefly after close so exit animation can play
  useEffect(() => {
    if (open) {
      setRendered(true);
      return;
    }
    const t = setTimeout(() => setRendered(false), 220);
    return () => clearTimeout(t);
  }, [open]);

  const panelWidthClass =
    config.layout === "grouped"
      ? "w-[min(36rem,calc(100vw-2rem))]"
      : "w-[min(20rem,calc(100vw-2rem))]";

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => {
          clearCloseTimer();
          if (!open) setRendered(true);
          setOpen((v) => !v);
        }}
        className={`${linkClassName} inline-flex items-center gap-1.5 transition-colors duration-200 ${
          open ? "text-[#1A1A1A] font-bold" : ""
        }`}
      >
        {label}
        <Chevron open={open} />
      </button>

      {/* Hover bridge + panel — always absolute so nav pill never expands */}
      {rendered ? (
        <div
          className={`absolute left-1/2 top-full z-[70] ${panelWidthClass} -translate-x-1/2 pt-3`}
          style={{
            pointerEvents: open ? "auto" : "none",
          }}
          aria-hidden={!open}
        >
          <div
            className="origin-top overflow-hidden rounded-2xl border border-[#EDE8E0] bg-white/95 backdrop-blur-md shadow-[0_4px_6px_rgba(26,35,50,0.04),0_20px_48px_rgba(26,35,50,0.12)]"
            style={{
              opacity: open ? 1 : 0,
              transform: open
                ? "translateY(0) scale(1)"
                : "translateY(-6px) scale(0.98)",
              transition: `opacity 200ms ${EASE_OUT}, transform 220ms ${EASE_OUT}`,
              willChange: "opacity, transform",
            }}
          >
            {config.layout === "grouped" ? (
              <KitchensMegaPanel
                categories={filtered}
                locale={locale}
                overviewLabel={overviewLabel}
                title={copy.title}
                exploreLabel={exploreLabel}
              />
            ) : (
              <FlatMegaPanel
                config={config}
                categories={filtered}
                locale={locale}
                overviewLabel={overviewLabel}
                title={copy.title}
                exploreLabel={exploreLabel}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HubMobileNavSection({
  config,
  label,
  locale,
  pathname,
  onNavigate,
}: {
  config: HubNavConfig;
  label: string;
  locale: Locale;
  pathname: string;
  onNavigate: () => void;
}) {
  const { categories } = useCms();
  const { t } = useTranslation();
  const copy = useHubCopy(config, locale);
  const [open, setOpen] = useState(false);
  const active = hubNavActive(pathname, config);
  const overviewLabel = t("nav.overview");
  const exploreLabel = t("nav.explore");

  const items = categories.filter(
    (c) =>
      config.categoryTypes.includes(String(c.categoryType || "")) &&
      c.slug &&
      isTopLevelCategory(c)
  );

  return (
    <div className="rounded-2xl border border-[#EEE8DF] bg-[#FAF8F5] overflow-hidden transition-shadow duration-300">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between px-4 py-3.5 text-left font-medium transition-colors duration-200 ${
          active ? "text-[#1A1A1A] font-bold" : "text-gray-600"
        }`}
      >
        <span>{label}</span>
        <Chevron open={open} />
      </button>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[#EEE8DF] bg-white px-2 py-2 space-y-0.5 max-h-72 overflow-y-auto">
            <Link
              href={config.href}
              onClick={onNavigate}
              className="flex items-center justify-between rounded-xl bg-[#F7F4EF] px-3 py-2.5 text-sm font-semibold text-[#1A2332] transition-colors hover:bg-[#F0EBE3]"
            >
              <span>
                {overviewLabel} · {copy.title}
              </span>
              <span className="text-[11px] font-medium text-[#9CA3AF]">
                {exploreLabel} →
              </span>
            </Link>
            {config.layout === "grouped"
              ? KITCHENS_SECTIONS.map((section) => {
                  const sectionItems = items.filter(
                    (c) => String(c.categoryType) === section.categoryType
                  );
                  return (
                    <div key={section.key} className="px-1 py-1.5">
                      <Link
                        href={section.href}
                        onClick={onNavigate}
                        className="block rounded-lg px-2.5 py-2 text-sm font-semibold text-[#1A2332] transition-colors hover:bg-[#F7F4EF]"
                      >
                        <span
                          className="text-[9px] uppercase tracking-[0.14em] font-semibold block mb-0.5"
                          style={{ color: section.accent }}
                        >
                          {section.shortLabel}
                        </span>
                        {section.label}
                      </Link>
                      {sectionItems.map((item) => (
                        <CategoryLink
                          key={item.id}
                          item={item}
                          locale={locale}
                          onNavigate={onNavigate}
                        />
                      ))}
                    </div>
                  );
                })
              : items.map((item) => (
                  <CategoryLink
                    key={item.id}
                    item={item}
                    locale={locale}
                    onNavigate={onNavigate}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { hubNavByHref } from "../../lib/hubNavigation";
