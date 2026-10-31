"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useCms } from "../../lib/CmsHomeContext";
import { pickCmsText } from "../../lib/cmsText";
import { categoryPublicPath } from "../../lib/categoryRoutes";
import type { CmsCategory } from "../../services/cmsPublic";
import type { Locale } from "../../i18n/translations";
import { useTranslation } from "../../i18n/LanguageProvider";
import {
  hubFallbackTitle,
  hubNavActive,
  hubNavByKey,
  type HubNavConfig,
  type HubPageCms,
} from "../../lib/hubNavigation";
import { KITCHENS_SECTIONS, kitchensSectionLabel, kitchensSectionShortLabel } from "../kitchens/kitchensConfig";

/** Delay before close — forgiving for diagonal mouse travel (Varsovia / Google-style). */
const HOVER_CLOSE_MS = 220;
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

const MegaOpenContext = createContext<{
  openKey: string | null;
  setOpenKey: Dispatch<SetStateAction<string | null>>;
}>({ openKey: null, setOpenKey: () => {} });

export function HubMegaProvider({ children, onOpenChange }: { children: ReactNode; onOpenChange?: (open: boolean) => void }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const value = useMemo(() => ({ openKey, setOpenKey }), [openKey]);
  
  useEffect(() => {
    onOpenChange?.(openKey !== null);
  }, [openKey, onOpenChange]);
  
  return (
    <MegaOpenContext.Provider value={value}>{children}</MegaOpenContext.Provider>
  );
}

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
    title: pickCmsText(hub?.title, hubFallbackTitle(config, locale), locale),
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
      className="group/link relative flex items-center rounded px-2.5 py-1.5 text-[13px] md:text-[12px] lg:text-[14px] leading-snug text-[#5C6370] transition-all duration-150 hover:bg-[#F7F4EF] hover:text-[#1A2332]"
    >
      <span className="truncate">{title}</span>
    </Link>
  );
}

function BuiltInFurnitureNavBlock({
  locale,
  exploreLabel,
  onNavigate,
}: {
  locale: Locale;
  exploreLabel: string;
  onNavigate?: () => void;
}) {
  const { categories } = useCms();
  const { t } = useTranslation();
  const config = hubNavByKey("builtInFurniture");
  const copy = useHubCopy(config, locale);
  const title = copy.title || t("nav.builtInFurniture");
  const items = categories.filter(
    (c) =>
      String(c.categoryType) === "built-in-furniture" &&
      c.slug &&
      isTopLevelCategory(c)
  );

  return (
    <div className="mt-2 border-t border-[#EEE8DF] pt-2.5">
      <Link
        href="/built-in-furniture"
        onClick={onNavigate}
        className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-[#F7F4EF] px-3.5 py-2.5 transition-colors duration-200 hover:bg-[#F0EBE3]"
      >
        <span className="text-[13px] md:text-[12px] lg:text-[14px] font-semibold text-[#1A2332]">
          {title}
        </span>
        <span className="text-[11px] font-medium text-[#9CA3AF] shrink-0 whitespace-nowrap">
          {exploreLabel} →
        </span>
      </Link>
      {items.length > 0 ? (
        <div className="grid grid-cols-3 gap-x-0.5 px-0.5">
          {items.map((item) => (
            <CategoryLink
              key={item.id}
              item={item}
              locale={locale}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
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
      label: pickCmsText(
        sub?.title,
        kitchensSectionLabel(section, locale),
        locale
      ),
    };
  });

  return (
    <div className="p-3 md:p-3.5">
      {/* Overview header */}
      <Link
        href="/kitchens"
        onClick={onNavigate}
        className="mb-2.5 flex items-center justify-between gap-2 rounded-xl bg-[#F7F4EF] px-3.5 py-2.5 transition-colors duration-200 hover:bg-[#F0EBE3]"
      >
        <span className="text-[13px] md:text-[12px] lg:text-[14px] font-semibold text-[#1A2332] leading-tight">
          {overviewLabel}
          <span className="mx-1 font-normal text-[#C4B8A8]">·</span>
          <span className="font-medium text-[#B38B6D]">{title}</span>
        </span>
        <span className="text-[11px] font-medium text-[#9CA3AF] tracking-wide shrink-0 whitespace-nowrap">
          {exploreLabel} →
        </span>
      </Link>

      {/* 3-column grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {groups.map(({ section, items, label }) => (
          <div key={section.key} className="min-w-0">
            <Link
              href={section.href}
              onClick={onNavigate}
              className="block rounded-lg px-2.5 py-2 mb-1 transition-colors duration-200 hover:bg-[#F7F4EF]"
            >
              <span
                className="text-[9px] uppercase tracking-[0.12em] font-bold block leading-none mb-1"
                style={{ color: section.accent }}
              >
                {kitchensSectionShortLabel(section, locale)}
              </span>
              <span className="block text-[13px] md:text-[12px] lg:text-[14px] font-semibold text-[#1A2332] truncate leading-tight">
                {label}
              </span>
            </Link>
            <div className="space-y-0 px-0.5">
              {items.length === 0 ? (
                <p className="text-[11px] text-[#C4B8A8] px-2 py-1">—</p>
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

      <BuiltInFurnitureNavBlock
        locale={locale}
        exploreLabel={exploreLabel}
        onNavigate={onNavigate}
      />
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
    <div className="p-2.5 md:p-3 min-w-[15rem] md:min-w-[16rem]">
      <Link
        href={config.href}
        onClick={onNavigate}
        className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-[#F7F4EF] px-3 py-2 transition-colors duration-200 hover:bg-[#F0EBE3]"
      >
        <span>
          <span
            className="text-[9px] uppercase tracking-[0.12em] font-semibold block mb-0.5 leading-none"
            style={{ color: config.accent }}
          >
            {overviewLabel}
          </span>
          <span className="text-[13px] md:text-[12px] lg:text-[14px] font-semibold text-[#1A2332] leading-tight">
            {title}
          </span>
        </span>
        <span className="text-[10px] font-medium text-[#9CA3AF] shrink-0 whitespace-nowrap">
          {exploreLabel} →
        </span>
      </Link>

      <div className="max-h-52 overflow-y-auto tk-no-scrollbar">
        {items.length === 0 ? (
          <p className="text-[12px] text-[#9CA3AF] px-3 py-3 text-center">
            No pages yet
          </p>
        ) : (
          <div
            className={
              items.length > 4
                ? "grid grid-cols-2 gap-x-0.5 gap-y-0"
                : "grid grid-cols-1 gap-0"
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
  onNavigate,
}: {
  config: HubNavConfig;
  label: string;
  locale: Locale;
  pathname: string;
  linkClassName: string;
  onNavigate?: () => void;
}) {
  const { categories } = useCms();
  const { t } = useTranslation();
  const { openKey, setOpenKey } = useContext(MegaOpenContext);
  const open = openKey === config.key;
  const copy = useHubCopy(config, locale);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
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
    closeTimer.current = setTimeout(() => {
      setOpenKey((current) => (current === config.key ? null : current));
    }, HOVER_CLOSE_MS);
  }, [clearCloseTimer, config.key, setOpenKey]);

  const handleEnter = useCallback(() => {
    // Only open on hover for desktop (non-touch devices)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      clearCloseTimer();
      setOpenKey(config.key);
    }
  }, [clearCloseTimer, config.key, setOpenKey]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearCloseTimer();
    setOpenKey((current) => (current === config.key ? null : config.key));
  }, [clearCloseTimer, config.key, setOpenKey]);

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
        setOpenKey((current) => (current === config.key ? null : current));
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenKey((current) => (current === config.key ? null : current));
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setOpenKey(null);
  }, [pathname, setOpenKey]);

  const panelWidthClass =
    config.layout === "grouped"
      ? "w-[min(32rem,calc(100vw-1rem))] lg:w-[min(36rem,calc(100vw-2rem))]"
      : "w-[min(18rem,calc(100vw-1rem))] lg:w-[min(20rem,calc(100vw-2rem))]";

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
    >
      <div className={`${linkClassName} inline-flex items-center gap-1`} ref={triggerRef}>
        <Link
          href={config.href}
          onClick={(e) => {
            // On touch devices, first click opens menu, second click navigates
            if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches && !open) {
              e.preventDefault();
              handleClick(e);
            } else {
              onNavigate?.();
            }
          }}
          className={`inline-flex items-center transition-colors duration-200 ${
            open ? "text-[#1A1A1A] font-bold" : ""
          }`}
        >
          {label}
        </Link>
        <button
          type="button"
          aria-label={`Open ${label} menu`}
          aria-expanded={open}
          aria-haspopup="true"
          onClick={(e) => {
            e.stopPropagation();
            clearCloseTimer();
            setOpenKey(open ? null : config.key);
          }}
          className="inline-flex items-center"
        >
          <Chevron open={open} />
        </button>
      </div>

      {/* Panel — fixed positioning to escape scroll container */}
      {open ? (
        <div
          className={`fixed z-[100] pt-2 ${panelWidthClass}`}
          style={{
            top: triggerRef.current
              ? `${triggerRef.current.getBoundingClientRect().bottom}px`
              : "100%",
            left: triggerRef.current
              ? `${triggerRef.current.getBoundingClientRect().left + triggerRef.current.getBoundingClientRect().width / 2}px`
              : "50%",
            transform: "translateX(-50%)",
            pointerEvents: "auto",
          }}
          ref={(el) => {
            if (!el) return;
            // After paint: clamp so panel never goes off-screen left or right
            requestAnimationFrame(() => {
              const rect = el.getBoundingClientRect();
              const vw = window.innerWidth;
              const gap = 8;
              if (rect.right > vw - gap) {
                const shift = rect.right - (vw - gap);
                el.style.transform = `translateX(calc(-50% - ${shift}px))`;
              } else if (rect.left < gap) {
                const shift = gap - rect.left;
                el.style.transform = `translateX(calc(-50% + ${shift}px))`;
              }
            });
          }}
          aria-hidden={!open}
        >
          <div
            className="origin-top overflow-hidden rounded-xl border border-[#EDE8E0] bg-white/98 backdrop-blur-md shadow-[0_4px_6px_rgba(26,35,50,0.04),0_16px_40px_rgba(26,35,50,0.12)]"
            style={{
              opacity: 1,
              transform: "translateY(0) scale(1)",
              transition: `opacity 200ms ${EASE_OUT}, transform 220ms ${EASE_OUT}`,
            }}
          >
            {config.layout === "grouped" ? (
              <KitchensMegaPanel
                categories={filtered}
                locale={locale}
                overviewLabel={overviewLabel}
                title={copy.title}
                exploreLabel={exploreLabel}
                onNavigate={() => setOpenKey(null)}
              />
            ) : (
              <FlatMegaPanel
                config={config}
                categories={filtered}
                locale={locale}
                overviewLabel={overviewLabel}
                title={copy.title}
                exploreLabel={exploreLabel}
                onNavigate={() => setOpenKey(null)}
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
    <div className="shrink-0">
      <div className="flex w-full items-center gap-1">
        <Link
          href={config.href}
          onClick={onNavigate}
          className={`flex min-w-0 flex-1 items-center py-3 px-4 rounded-full text-[15px] leading-normal text-left font-medium transition ${
            active ? "text-[#1A1A1A] font-bold bg-[#F5F3EF]" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <span className="min-w-0 truncate">{label || copy.title}</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`Open ${label || copy.title} menu`}
          className="shrink-0 rounded-full p-3 text-gray-500 hover:bg-gray-50"
        >
          <Chevron open={open} />
        </button>
      </div>

      {open ? (
        <div className="mx-2 mb-2 rounded-2xl border border-[#EEE8DF] bg-white px-2 py-2 space-y-0.5 max-h-72 overflow-y-auto">
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
                          {kitchensSectionShortLabel(section, locale)}
                        </span>
                        {kitchensSectionLabel(section, locale)}
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
            {config.layout === "grouped" ? (
              <BuiltInFurnitureNavBlock
                locale={locale}
                exploreLabel={exploreLabel}
                onNavigate={onNavigate}
              />
            ) : null}
        </div>
      ) : null}
    </div>
  );
}

export { hubNavByHref } from "../../lib/hubNavigation";
