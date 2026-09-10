"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import AdminSkeleton from "@/components/AdminSkeleton";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const isUsersAdminOnly = pathname === "/users";

  useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) router.replace("/login");
    if (user && isLogin) router.replace("/");
    if (user && isUsersAdminOnly && user.role !== "admin") router.replace("/");
  }, [user, loading, isLogin, isUsersAdminOnly, router]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#F4F5F7] p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <AdminSkeleton variant="panel" />
        </div>
      </div>
    );
  }

  if (!user && !isLogin) return null;
  if (user && isLogin) return null;

  return <>{children}</>;
}
