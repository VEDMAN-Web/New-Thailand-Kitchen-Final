"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import {
  collectProductFilterTabs,
  PRODUCTS_PER_PAGE,    
  tabToSlug,
  type ProductFilterTab,
  type ProductItem,
} from "./productData";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";
import { smoothScrollToId } from "../../lib/smoothScroll";
import { fetchMergedProducts } from "../../services/cmsPublic";
import { useCms } from "../../lib/CmsHomeContext";
import { pickCmsText } from "../../lib/cmsText";

// Only re-fetch in background if data is older than 30 seconds
const STALE_AFTER_MS = 30_000;
let cachedProducts: ProductItem[] | null = null;
let productsCacheTimestamp = 0;

const tabLabelKeys: Record<ProductFilterTab, TranslationKey> = {
  All: "gallery.filter.all",
  Modern: "products.tab.modern",
  Islands: "products.tab.islands",
  "U Shape": "products.tab.uShape",
  "L Shape": "products.tab.lShape",
  Straight: "products.tab.straight",
  "T Shape": "products.tab.tShape",
  "Best Seller": "products.tab.bestSeller",
};

const KNOWN_LAYOUT_KEYS = new Set([
  "modern",
  "islands",
  "u-shape",
  "l-shape",
  "straight",
  "t-shape",
]);

function normalizeFilterKey(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "-");
}

function tagMatchesFilter(tag: ProductItem["tag"], target: string) {
  if (typeof tag === "string") {
    return tag.toLowerCase() === target || normalizeFilterKey(tag) === normalizeFilterKey(target);
  }
  if (tag && typeof tag === "object") {
    return Object.values(tag as Record<string, string>).some(
      (v) =>
        typeof v === "string" &&
        (v.toLowerCase() === target ||
          normalizeFilterKey(v) === normalizeFilterKey(target))
    );
  }
  return false;
}

/**
 * Match product to a filter tab.
 * Custom CMS categories must not leak into layout tabs via layoutType fallback ("Modern").
 */
function productMatchesLayoutFilter(item: ProductItem, layout: string) {
  if (layout === "All") return true;
  if (layout === "Best Seller") return Boolean(item.bestSeller);

  const target = layout.toLowerCase();
  const targetKey = normalizeFilterKey(layout);
  const layoutKey = normalizeFilterKey(String(item.layout || ""));
  const typeKey = normalizeFilterKey(String(item.layoutType || ""));
  const isCustomCategory = Boolean(layoutKey && !KNOWN_LAYOUT_KEYS.has(layoutKey));

  if (isCustomCategory) {
    return (
      String(item.layout || "").toLowerCase() === target ||
      layoutKey === targetKey ||
      tagMatchesFilter(item.tag, target)
    );
  }

  return (
    typeKey === targetKey ||
    layoutKey === targetKey ||
    String(item.layout || "").toLowerCase() === target ||
    String(item.layoutType || "").toLowerCase() === target ||
    tagMatchesFilter(item.tag, target)
  );
}

function tabFromQuery(
  value: string | null,
  tabs: string[]
): string | null {
  if (!value) return null;
  const normalized = value.toLowerCase().replace(/[_\s]+/g, "-");
  if (normalized === "all") return "All";
  if (normalized === "best-seller" || normalized === "bestseller") {
    return "Best Seller";
  }
  const match = tabs.find((tab) => tabToSlug(tab) === normalized);
  return match ?? null;
}

/**
 * Build the page items shown in the mobile pagination strip.
 * Always shows: first, last, current, one neighbour on each side.
 * Gaps of 2+ are replaced with a single "..." token.
 *
 * Examples (current=6, total=11):  1 ... 5 6 7 ... 11
 * Examples (current=2, total=11):  1 2 3 ... 11
 * Examples (current=11, total=11): 1 ... 9 10 11
 */
function buildMobilePages(current: number, total: number): (number | "...")[] {
  if (total <= 5) {
    // Few enough pages — show all, no ellipsis needed
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const visible = new Set<number>();
  visible.add(1);
  visible.add(total);
  // Current page ± 1 neighbour
  for (let i = Math.max(1, current - 1); i <= Math.min(total, current + 1); i++) {
    visible.add(i);
  }

  const pages = Array.from(visible).sort((a, b) => a - b);

  // Insert "..." between non-consecutive numbers
  const result: (number | "...")[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) {
      result.push("...");
    }
    result.push(pages[i]);
  }
  return result;
}

export default function ProductsListSection({
  initialItems,
  initialCategory,
  initialPage = 1,
}: {
  initialItems: ProductItem[];
  /** Category tab pre-selected via a /products/<category> URL (Smart merged route). */
  initialCategory?: string;
  /** Page number pre-selected from the ?page= query param (server-rendered). */
  initialPage?: number;
}) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { categories } = useCms();
  const searchParams = useSearchParams();
  const [layout, setLayout] = useState<string>(initialCategory || "All");
  const [page, setPage] = useState(Math.max(1, initialPage));

  // Hydrate from module-level cache if fresh, otherwise use SSR data
  const startItems =
    cachedProducts && Date.now() - productsCacheTimestamp < STALE_AFTER_MS
      ? cachedProducts
      : initialItems;

  const [items, setItems] = useState<ProductItem[]>(startItems);
  const fetchedRef = useRef(false);

  // Re-fetch only when cache is stale (>30s) — not on every mount
  useEffect(() => {
    if (cachedProducts && Date.now() - productsCacheTimestamp < STALE_AFTER_MS) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchMergedProducts()
      .then((fresh) => {
        if (fresh.length > 0) {
          cachedProducts = fresh;
          productsCacheTimestamp = Date.now();
          setItems(fresh);
        }
      })
      .catch(() => {});
  }, []);

  const filterTabs = useMemo(() => {
    const extras: string[] = [];
    for (const cat of categories || []) {
      if (String(cat.categoryType || "") !== "layout") continue;
      const title = pickCmsText(cat.title, "", locale);
      if (title) extras.push(title);
    }
    for (const item of items) {
      if (item.layout) extras.push(String(item.layout));
      if (item.layoutType) extras.push(String(item.layoutType));
    }
    return collectProductFilterTabs(extras);
  }, [categories, items, locale]);

  /**
   * Navigate to a page number by updating the ?page= query param.
   * Page 1 uses /products (no param) so canonical stays clean.
   * Uses router.replace so pagination doesn't pollute the history stack.
   */
  function pushPage(n: number) {
    setPage(n);
    if (n <= 1) {
      router.replace("/products", { scroll: false });
    } else {
      router.replace(`/products?page=${n}`, { scroll: false });
    }
  }

  // Sync page state from the URL when the user navigates (back/forward)
  // or when a ?page= param is present on first render.
  // Skip when initialCategory is set — those routes (/products/u-shape) have
  // no ?page= param and manage their own pagination state in isolation.
  useEffect(() => {
    if (initialCategory) return;
    const raw = searchParams.get("page");
    const n = raw ? parseInt(raw, 10) : 1;
    const clamped = Number.isFinite(n) && n >= 1 ? n : 1;
    setPage(clamped);
  }, [searchParams, initialCategory]);

  // Skip legacy ?tab=/?filter= query-string handling when this view was
  // already given an initialCategory via a /products/<category> URL — the
  // URL itself is now the source of truth for the selected category.
  useEffect(() => {
    if (initialCategory) return;
    const fromQuery =
      tabFromQuery(searchParams.get("tab"), filterTabs) ||
      tabFromQuery(searchParams.get("filter"), filterTabs);
    if (fromQuery) {
      setLayout(fromQuery);
      setPage(1);
    }
    if (fromQuery === "Best Seller" || searchParams.get("tab") === "best-seller") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => smoothScrollToId("best-seller"));
      });
    }
  }, [searchParams, filterTabs, initialCategory]);

  const filtered = useMemo(() => {
    let list = [...items];

    if (layout === "All") {
      // Show everything — no filter applied
    } else if (layout === "Best Seller") {
      list = list.filter((item) => item.bestSeller);
    } else {
      list = list.filter((item) => productMatchesLayoutFilter(item, layout));
    }

    return list;
  }, [layout, items]);

  const activeTabLabel =
    layout in tabLabelKeys ? t(tabLabelKeys[layout as ProductFilterTab]) : layout;

  const countText =
    layout === "All"
      ? t("products.count", { count: filtered.length })
      : t("products.countByTab", { label: activeTabLabel, count: filtered.length });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <section id="best-seller" className="pb-8 sm:pb-16 lg:pb-24 pt-6 sm:pt-10 lg:pt-12 scroll-mt-28">
      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
        {filterTabs.map((item) => {
          const isActive = layout === item;
          const label =
            item in tabLabelKeys
              ? t(tabLabelKeys[item as ProductFilterTab])
              : item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => {
                setLayout(item);
                setPage(1);
                router.push(
                  item === "All" ? "/products" : `/products/${tabToSlug(item)}`,
                  { scroll: false }
                );
              }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-medium transition ${
                isActive
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-[#EDE8E1] text-[#1A1A1A] hover:bg-[#E5DFD6]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 sm:mt-8">
        <p className="text-sm text-[#1A1A1A] font-medium">
          {countText}
        </p>
      </div>

      {pageItems.length > 0 ? (
        <div className="mt-5 sm:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
          {pageItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-8 sm:mt-12 text-[#6B6B6B]">{t("products.empty")}</p>
      )}

      {totalPages > 1 ? (
        <div className="mt-8 sm:mt-12 flex items-center justify-center gap-1 sm:gap-3">
          {/* Previous button */}
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => pushPage(Math.max(1, currentPage - 1))}
            className="flex items-center justify-center w-10 h-10 rounded-full text-[#1A1A1A] disabled:opacity-30 hover:bg-[#EDE8E1] transition text-lg leading-none"
          >
            ‹
          </button>

          {/* Desktop: show all pages */}
          <span className="hidden sm:contents">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`Page ${n}`}
                aria-current={n === currentPage ? "page" : undefined}
                onClick={() => pushPage(n)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition ${
                  n === currentPage
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#1A1A1A] hover:bg-[#EDE8E1]"
                }`}
              >
                {n}
              </button>
            ))}
          </span>

          {/* Mobile: smart windowed pagination with ellipses */}
          <span className="contents sm:hidden">
            {buildMobilePages(currentPage, totalPages).map((item, idx) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex items-center justify-center w-8 h-10 text-[#6B6B6B] text-sm select-none"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  aria-label={`Page ${item}`}
                  aria-current={item === currentPage ? "page" : undefined}
                  onClick={() => pushPage(item as number)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition flex-shrink-0 ${
                    item === currentPage
                      ? "bg-[#1A1A1A] text-white"
                      : "text-[#1A1A1A] hover:bg-[#EDE8E1]"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </span>

          {/* Next button */}
          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage >= totalPages}
            onClick={() => pushPage(Math.min(totalPages, currentPage + 1))}
            className="flex items-center justify-center w-10 h-10 rounded-full text-[#1A1A1A] disabled:opacity-30 hover:bg-[#EDE8E1] transition text-lg leading-none"
          >
            ›
          </button>
        </div>
      ) : null}
    </section>
  );
}
