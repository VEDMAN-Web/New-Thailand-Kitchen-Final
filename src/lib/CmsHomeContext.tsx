"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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
  loading: boolean;
};

const CmsContext = createContext<CmsContextValue>({
  sections: {},
  products: [],
  loading: true,
});

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<HomeSections>({});
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    Promise.all([fetchHomeSections(), fetchMergedProducts()])
      .then(([home, productList]) => {
        if (!alive) return;
        setSections(home || {});
        setProducts(productList || []);
      })
      .catch(() => {
        /* keep empty → components fall back to static/i18n */
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(
    () => ({ sections, products, loading }),
    [sections, products, loading]
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  return useContext(CmsContext);
}

export function useCmsSection<T = any>(key: string): T | undefined {
  const { sections } = useCms();
  return sections?.[key] as T | undefined;
}
