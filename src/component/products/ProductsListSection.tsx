"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import {
  productFilterTabs,
  PRODUCTS_PER_PAGE,
  tabToSlug,
  type ProductFilterTab,
  type ProductItem,
  type ProductLayout,
} from "./productData";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";
import { pickCmsText } from "../../lib/cmsText";
import { smoothScrollToId } from "../../lib/smoothScroll";
import { fetchMergedCategories } from "../../services/cmsPublic";

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
  const { t, locale } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [layout, setLayout] = useState<string>(initialCategory || "All");
  const [page, setPage] = useState(1);
  const [items] = useState<ProductItem[]>(initialItems);
  /** EN id for filter matching + raw CMS title for locale display */
  const [cmsCategories, setCmsCategories] = useState<
    { id: string; title: unknown }[]
  >([]);

  useEffect(() => {
    let alive = true;
    fetchMergedCategories().then((cats) => {
      if (!alive) return;
      setCmsCategories(
        cats
          .map((c) => ({
            id: pickCmsText(c.title, "", "EN"),
            title: c.title,
          }))
          .filter((c) => c.id)
      );
    });
    return () => {
      alive = false;
    };
  }, []);

  const filterTabs = useMemo(() => {
    const base = [...productFilterTabs] as string[];
    const known = new Set(base.map((t) => t.toLowerCase()));
    for (const cat of cmsCategories) {
      if (!known.has(cat.id.toLowerCase())) {
        base.splice(base.length - 1, 0, cat.id); // before Best Seller
        known.add(cat.id.toLowerCase());
      }
    }
    // Also surface categories present on products but missing from CMS list
    for (const p of items) {
      const cat = (p.layout || p.layoutType || "").trim();
      if (
        cat &&
        !known.has(cat.toLowerCase()) &&
        cat.toLowerCase() !== "modern" &&
        cat.toLowerCase() !== "all"
      ) {
        base.splice(base.length - 1, 0, cat);
        known.add(cat.toLowerCase());
      }
    }
    return base;
  }, [cmsCategories, items]);

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
      // All other tabs (Modern, Islands, U Shape, L Shape, Straight, T Shape, custom CMS)
      // Filter by matching layoutType, layout string, or tag — case-insensitive
      list = list.filter(
        (item) =>
          item.layoutType?.toLowerCase() === layout.toLowerCase() ||
          item.layout?.toLowerCase() === layout.toLowerCase() ||
          (typeof item.tag === "string" &&
            item.tag.toLowerCase() === layout.toLowerCase()) ||
          (typeof item.tag === "object" &&
            item.tag !== null &&
            Object.values(item.tag as Record<string, string>).some(
              (v) => typeof v === "string" && v.toLowerCase() === layout.toLowerCase()
            ))
      );
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
      <div className="flex flex-wrap gap-3">
        {filterTabs.map((item) => {
          const isActive = layout === item;
          const cmsCat = cmsCategories.find((c) => c.id === item);
          const label =
            item in tabLabelKeys
              ? t(tabLabelKeys[item as ProductFilterTab])
              : pickCmsText(cmsCat?.title, item, locale);
          return (
            <button
              key={item}
              type="button"
              onClick={() => {
                setLayout(item);
                setPage(1);
                // Real, crawlable category URL (e.g. /products/u-shape) instead of
                // a query-string — this is what makes category browsing SEO
                // friendly. "All" goes back to the plain /products listing.
                const path =
                  item === "All" ? "/products" : `/products/${tabToSlug(item)}`;
                router.push(path, { scroll: false });
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
