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
  fetchMergedProducts,
  type HomeSections,
} from "../services/cmsPublic";
import type { ProductItem } from "../component/products/productData";

type CmsContextValue = {
  sections: HomeSections;
  products: ProductItem[];
  /** True only on the very first fetch (never blank after that). */
  loading: boolean;
  /** Soft refresh without clearing current CMS data. */
  refresh: () => Promise<void>;
};

const CmsContext = createContext<CmsContextValue>({
  sections: {},
  products: [],
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

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<HomeSections>({});
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const aliveRef = useRef(true);
  const fadeRef = useRef<HTMLDivElement>(null);
  const hasDataRef = useRef(false);
  const sectionsRef = useRef<HomeSections>({});
  const productsRef = useRef<ProductItem[]>([]);
  const fetchingRef = useRef(false);

  const applyData = useCallback(
    (nextSections: HomeSections, nextProducts: ProductItem[]) => {
      const changed =
        JSON.stringify(sectionsRef.current) !== JSON.stringify(nextSections) ||
        JSON.stringify(productsRef.current) !== JSON.stringify(nextProducts);

      if (!changed && hasDataRef.current) return;

      const commit = () => {
        sectionsRef.current = nextSections;
        productsRef.current = nextProducts;
        setSections(nextSections);
        setProducts(nextProducts);
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
        const [home, productList] = await Promise.all([
          fetchHomeSections(),
          fetchMergedProducts(),
        ]);
        if (!aliveRef.current) return;
        applyData(home || {}, productList || []);
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
    void load(true);

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
  }, [load]);

  const refresh = useCallback(async () => {
    await load(false);
  }, [load]);

  const value = useMemo(
    () => ({ sections, products, loading, refresh }),
    [sections, products, loading, refresh]
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
