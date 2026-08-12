"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import {
  productFilterTabs,
  PRODUCTS_PER_PAGE,    
  tabToSlug,
  type ProductFilterTab,
  type ProductItem,
} from "./productData";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";
import { smoothScrollToId } from "../../lib/smoothScroll";
import { fetchMergedProducts } from "../../services/cmsPublic";

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

export default function ProductsListSection({
  initialItems,
  initialCategory,
}: {
  initialItems: ProductItem[];
  /** Category tab pre-selected via a /products/<category> URL (Smart merged route). */
  initialCategory?: string;
}) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [layout, setLayout] = useState<string>(initialCategory || "All");
  const [page, setPage] = useState(1);

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

  const filterTabs = useMemo(
    () => [...productFilterTabs] as string[],
    []
  );

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <section id="best-seller" className="pb-16 lg:pb-24 pt-10 lg:pt-12 scroll-mt-28">
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

      <div className="mt-8">
        <p className="text-sm text-[#1A1A1A] font-medium">
          {t("products.count", { count: filtered.length })}
        </p>
      </div>

      {pageItems.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {pageItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-[#6B6B6B]">{t("products.empty")}</p>
      )}

      {totalPages > 1 ? (
        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="w-10 h-10 rounded-full text-[#1A1A1A] disabled:opacity-30 hover:bg-[#EDE8E1] transition"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`w-10 h-10 rounded-full text-sm font-medium transition ${
                n === currentPage
                  ? "bg-[#1A1A1A] text-white"
                  : "text-[#1A1A1A] hover:bg-[#EDE8E1]"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="w-10 h-10 rounded-full text-[#1A1A1A] disabled:opacity-30 hover:bg-[#EDE8E1] transition"
          >
            ›
          </button>
        </div>
      ) : null}
    </section>
  );
}
