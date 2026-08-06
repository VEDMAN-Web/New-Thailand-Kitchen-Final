"use client";

import { usePathname } from "next/navigation";
import AdminShell from "@/components/AdminShell";

const TITLE_BY_PATH: Record<string, string> = {
  "/": "Home Management",
  "/products": "Product Inventory",
  "/categories": "Categories",
  "/gallery": "Gallery Management",
  "/blogs": "Blog Content Manager",
  "/faqs": "FAQs",
  "/contacts": "Contact Enquiries",
  "/privacy": "Privacy Policy",
  "/terms": "Terms & Conditions",
  "/users": "User Management",
  "/varsovia": "Varsovia Kitchen CMS",
};

export default function PersistentAdminChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  const title =
    TITLE_BY_PATH[pathname] ||
    (pathname.startsWith("/varsovia")
      ? "Varsovia Kitchen CMS"
      : "Admin");

  return <AdminShell title={title}>{children}</AdminShell>;
}
