"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

/** Open resource sheets / child modals register so page Save writes them too. */
export type CmsFlushFn = () => Promise<boolean>;

type CmsFlushSavesValue = {
  register: (id: string, fn: CmsFlushFn | null) => void;
  flushAll: () => Promise<void>;
};

const CmsFlushSavesContext = createContext<CmsFlushSavesValue | null>(null);

export function CmsFlushSavesProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef(new Map<string, CmsFlushFn>());

  const register = useCallback((id: string, fn: CmsFlushFn | null) => {
    if (!fn) mapRef.current.delete(id);
    else mapRef.current.set(id, fn);
  }, []);

  const flushAll = useCallback(async () => {
    const fns = [...mapRef.current.values()];
    for (const fn of fns) {
      const ok = await fn();
      if (ok === false) {
        throw new Error("Save the open card first — its fields did not write to the live site.");
      }
    }
  }, []);

  const value = useMemo(() => ({ register, flushAll }), [register, flushAll]);

  return (
    <CmsFlushSavesContext.Provider value={value}>{children}</CmsFlushSavesContext.Provider>
  );
}

export function useCmsFlushSaves() {
  return useContext(CmsFlushSavesContext);
}

/** Keep `commit` in a ref so the latest modal/form state is what page Save writes. */
export function useRegisterCmsFlush(id: string, active: boolean, commit: CmsFlushFn) {
  const ctx = useCmsFlushSaves();
  const commitRef = useRef(commit);
  commitRef.current = commit;

  useEffect(() => {
    if (!ctx) return;
    if (!active) {
      ctx.register(id, null);
      return;
    }
    ctx.register(id, () => commitRef.current());
    return () => ctx.register(id, null);
  }, [ctx, id, active]);
}
