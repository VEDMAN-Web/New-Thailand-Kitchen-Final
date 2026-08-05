"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  adminLogin,
  adminMe,
  type AdminUser,
  type SiteId,
} from "@/services/adminAPI";

type AdminAuthContextValue = {
  user: AdminUser | null;
  loading: boolean;
  siteId: SiteId;
  setSiteId: (id: SiteId) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const SITE_KEY = "admin_site_id";
const VALID_SITES: SiteId[] = ["thailand-kitchen", "varsovia-kitchen"];

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteId, setSiteIdState] = useState<SiteId>("thailand-kitchen");

  useEffect(() => {
    let cancelled = false;

    const saved = localStorage.getItem(SITE_KEY) as SiteId | null;
    if (saved && VALID_SITES.includes(saved)) {
      setSiteIdState(saved);
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      return;
    }

    const boot = async () => {
      try {
        const res = await adminMe();
        if (!cancelled) setUser(res.user);
      } catch {
        localStorage.removeItem("admin_token");
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Never stay on "Loading admin…" forever
    const hardStop = window.setTimeout(() => {
      if (!cancelled) {
        localStorage.removeItem("admin_token");
        setUser(null);
        setLoading(false);
      }
    }, 8000);

    boot().finally(() => window.clearTimeout(hardStop));

    return () => {
      cancelled = true;
      window.clearTimeout(hardStop);
    };
  }, []);

  const setSiteId = useCallback((id: SiteId) => {
    setSiteIdState(id);
    localStorage.setItem(SITE_KEY, id);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminLogin(email, password);
    localStorage.setItem("admin_token", res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, siteId, setSiteId, login, logout }),
    [user, loading, siteId, setSiteId, login, logout]
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
