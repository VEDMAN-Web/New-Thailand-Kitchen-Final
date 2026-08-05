"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import {
  productFilterTabs,
  PRODUCTS_PER_PAGE,
  type ProductFilterTab,
  type ProductItem,
  type ProductLayout,
} from "./productData";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";

const tabLabelKeys: Record<ProductFilterTab, TranslationKey> = {
  Modern: "products.tab.modern",
  Islands: "products.tab.islands",
  "U Shape": "products.tab.uShape",
  "L Shape": "products.tab.lShape",
  Straight: "products.tab.straight",
  "T Shape": "products.tab.tShape",
  "Best Seller": "products.tab.bestSeller",
};

function tabToSlug(tab: ProductFilterTab) {
  return tab.toLowerCase().replace(/\s+/g, "-");
}

function tabFromQuery(value: string | null): ProductFilterTab | null {
  if (!value) return null;
  const normalized = value.toLowerCase().replace(/[_\s]+/g, "-");
  if (normalized === "best-seller" || normalized === "bestseller") {
    return "Best Seller";
  }
  const match = productFilterTabs.find(
    (tab) => tabToSlug(tab) === normalized
  );
  return match ?? null;
}

export default function ProductsListSection({ initialItems }: { initialItems: ProductItem[] }) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [layout, setLayout] = useState<ProductFilterTab>("Modern");
  const [page, setPage] = useState(1);
  const [items] = useState<ProductItem[]>(initialItems);

  useEffect(() => {
    const fromQuery =
      tabFromQuery(searchParams.get("tab")) ||
      tabFromQuery(searchParams.get("filter"));
    if (fromQuery) {
      setLayout(fromQuery);
      setPage(1);
    }
    if (fromQuery === "Best Seller" || searchParams.get("tab") === "best-seller") {
      requestAnimationFrame(() => {
        document
          .getElementById("best-seller")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...items];

    if (layout === "Best Seller") {
      list = list.filter((item) => item.bestSeller);
    } else if (layout !== "Modern") {
      list = list.filter((item) => item.layoutType === (layout as ProductLayout));
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
      {/* Layout tabs + Best Seller */}
      <div className="flex flex-wrap gap-3">
        {productFilterTabs.map((item) => {
          const isActive = layout === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => {
                setLayout(item);
                setPage(1);
                const url = new URL(window.location.href);
                url.searchParams.set("tab", tabToSlug(item));
                window.history.replaceState({}, "", url.toString());
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
                isActive
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-[#EDE8E1] text-[#1A1A1A] hover:bg-[#E5DFD6]"
              }`}
            >
              {t(tabLabelKeys[item])}
            </button>
          );
        })}
      </div>

      {/* Count */}
      <div className="mt-8">
        <p className="text-sm text-[#1A1A1A] font-medium">
          {t("products.count", { count: filtered.length })}
        </p>
      </div>

      {/* Grid */}
      {pageItems.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {pageItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-[#6B6B6B]">{t("products.empty")}</p>
      )}

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="w-10 h-10 rounded-full text-[#1A1A1A] disabled:opacity-30 hover:bg-[#EDE8E1] transition"
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              className={`w-10 h-10 rounded-full text-sm font-semibold transition ${
                currentPage === num
                  ? "bg-[#E0905A] text-white"
                  : "text-[#1A1A1A] hover:bg-[#EDE8E1]"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="w-10 h-10 rounded-full text-[#1A1A1A] disabled:opacity-30 hover:bg-[#EDE8E1] transition"
          >
            →
          </button>
        </div>
      ) : null}
    </section>
  );
}
