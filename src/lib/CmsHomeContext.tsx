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
  loading: boolean;
  refresh: () => Promise<void>;
};

const CmsContext = createContext<CmsContextValue>({
  sections: {},
  products: [],
  categories: [],
  loading: true,
  refresh: async () => {},
});

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
  const hasDataRef = useRef(
    Boolean(initialSections || initialProducts || initialCategories)
  );
  const fetchingRef = useRef(false);

  const load = useCallback(async (isInitial: boolean) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const [home, productList, categoryList] = await Promise.all([
        fetchHomeSections(),
        fetchMergedProducts(),
        fetchMergedCategories(),
      ]);
      if (!aliveRef.current) return;
      setSections(home || {});
      setProducts(productList || []);
      setCategories(categoryList || []);
      hasDataRef.current = true;
    } catch {
      /* keep previous */
    } finally {
      fetchingRef.current = false;
      if (aliveRef.current && isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    if (!hasDataRef.current) void load(true);
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    await load(false);
  }, [load]);

  const value = useMemo(
    () => ({ sections, products, categories, loading, refresh }),
    [sections, products, categories, loading, refresh]
  );

  return (
    <CmsContext.Provider value={value}>{children}</CmsContext.Provider>
  );
}

export function useCms() {
  return useContext(CmsContext);
}

export function useCmsSection<T = any>(key: string): T | undefined {
  const { sections } = useCms();
  return sections?.[key] as T | undefined;
}
