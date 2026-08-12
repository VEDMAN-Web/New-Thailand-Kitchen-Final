"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  fetchHomeSections,
  fetchMergedCategories,
  fetchMergedProducts,
  type CmsCategory,
  type HomeSections,
} from "../services/cmsPublic";
import type { ProductItem } from "../component/products/productData";

export type { HomeSections };

type CmsContextValue = {
  sections: HomeSections;
  products: ProductItem[];
  categories: CmsCategory[];
  /** True only on the very first fetch (never blank after that). */
  loading: boolean;
  /** Soft refresh without clearing current CMS data. */
  refresh: () => Promise<void>;
};

const CmsContext = createContext<CmsContextValue>({
  sections: {},
  products: [],
  categories: [],
  loading: true,
  refresh: async () => {},
});

function softSwap(el: HTMLElement | null, commit: () => void) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (!el || reduce) {
    commit();
    return;
  }

  el.style.transition = "opacity 160ms ease";
  el.style.opacity = "0.55";
  window.setTimeout(() => {
    commit();
    requestAnimationFrame(() => {
      el.style.opacity = "1";
    });
  }, 100);
}

export function CmsProvider({
  children,
  initialSections,
  initialProducts,
  initialCategories,
}: {
  children: React.ReactNode;
  initialSections?: HomeSections;
  initialProducts?: ProductItem[];
  initialCategories?: CmsCategory[];
}) {
  const [sections, setSections] = useState<HomeSections>(initialSections || {});
  const [products, setProducts] = useState<ProductItem[]>(initialProducts || []);
  const [categories, setCategories] = useState<CmsCategory[]>(
    initialCategories || []
  );
  const [loading, setLoading] = useState(
    !initialSections && !initialProducts && !initialCategories
  );
  const aliveRef = useRef(true);
  const fadeRef = useRef<HTMLDivElement>(null);
  const hasDataRef = useRef(
    Boolean(initialSections || initialProducts || initialCategories)
  );
  const sectionsRef = useRef<HomeSections>(initialSections || {});
  const productsRef = useRef<ProductItem[]>(initialProducts || []);
  const categoriesRef = useRef<CmsCategory[]>(initialCategories || []);
  const fetchingRef = useRef(false);

  const applyData = useCallback(
    (
      nextSections: HomeSections,
      nextProducts: ProductItem[],
      nextCategories: CmsCategory[]
    ) => {
      const changed =
        JSON.stringify(sectionsRef.current) !== JSON.stringify(nextSections) ||
        JSON.stringify(productsRef.current) !== JSON.stringify(nextProducts) ||
        JSON.stringify(categoriesRef.current) !== JSON.stringify(nextCategories);

      if (!changed && hasDataRef.current) return;

      const commit = () => {
        sectionsRef.current = nextSections;
        productsRef.current = nextProducts;
        categoriesRef.current = nextCategories;
        setSections(nextSections);
        setProducts(nextProducts);
        setCategories(nextCategories);
        hasDataRef.current = true;
      };

      // First paint: commit immediately (static/i18n already showing).
      // Later CMS updates from admin: soft crossfade, never clear to blank.
      if (hasDataRef.current && changed) {
        softSwap(fadeRef.current, commit);
      } else {
        commit();
      }
    },
    []
  );

  const load = useCallback(
    async (isInitial: boolean) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      try {
        const [home, productList, categoryList] = await Promise.all([
          fetchHomeSections(),
          fetchMergedProducts(),
          fetchMergedCategories(),
        ]);
        if (!aliveRef.current) return;
        applyData(home || {}, productList || [], categoryList || []);
      } catch {
        /* keep previous / empty → components fall back to static/i18n */
      } finally {
        fetchingRef.current = false;
        if (aliveRef.current && isInitial) {
          setLoading(false);
        }
      }
    },
    [applyData]
  );

  useEffect(() => {
    aliveRef.current = true;
    
    // If we have initial data, skip the first fetch but still set up polling
    if (!initialSections && !initialProducts && !initialCategories) {
      void load(true);
    }

    const softRefresh = () => {
      void load(false);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") softRefresh();
    };

    window.addEventListener("focus", softRefresh);
    document.addEventListener("visibilitychange", onVisibility);

    // Catch admin saves while this tab stays open
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") softRefresh();
    }, 20000);

    return () => {
      aliveRef.current = false;
      window.removeEventListener("focus", softRefresh);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
    };
  }, [load, initialSections, initialProducts, initialCategories]);

  const refresh = useCallback(async () => {
    await load(false);
  }, [load]);

  const value = useMemo(
    () => ({ sections, products, categories, loading, refresh }),
    [sections, products, categories, loading, refresh]
  );

  return (
    <CmsContext.Provider value={value}>
      <div ref={fadeRef} className="min-h-0 tk-content-fade">
        {children}
      </div>
    </CmsContext.Provider>
  );
}

export function useCms() {
  return useContext(CmsContext);
}

export function useCmsSection<T = any>(key: string): T | undefined {
  const { sections } = useCms();
  return sections?.[key] as T | undefined;
}
