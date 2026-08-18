"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AdminShell from "@/components/AdminShell";
import { adminHubByParam } from "@/lib/thailandHubs";

const TITLE_BY_PATH: Record<string, string> = {
  "/": "Home",
  "/products": "Products",
  "/categories": "Categories",
  "/gallery": "Gallery",
  "/blogs": "Guides",
  "/faqs": "FAQ",
  "/contacts": "Contact Inbox",
  "/privacy": "Privacy Policy",
  "/terms": "Terms & Conditions",
  "/users": "Users",
  "/varsovia": "Varsovia Kitchen CMS",
  "/varsovia/furniture": "Furniture",
  "/varsovia/interior-design": "Interior",
  "/varsovia/complete-interiors": "Complete Interiors",
  "/varsovia/services": "Services",
  "/varsovia/locations": "Locations",
  "/varsovia/for-developers": "For Developers",
  "/varsovia/journal": "Journal",
  "/varsovia/about-brand": "About",
};

function ChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  const hub = adminHubByParam(searchParams.get("hub"));
  const section = searchParams.get("section");

  let title =
    TITLE_BY_PATH[pathname] ||
    (pathname.startsWith("/varsovia")
      ? "Varsovia Kitchen CMS"
      : "Admin");

  if (pathname === "/varsovia/furniture") {
    title = "Furniture";
  }

  if (pathname === "/categories" && hub) {
    title = hub.label;
  } else if (pathname === "/") {
    if (section === "contactPage") title = "Contact";
    else if (section === "catalogue") title = "Free Catalogue";
    else if (section === "siteChrome") title = "Header & SEO";
    else if (section === "faqPage") title = "FAQ Page";
    else if (section === "blogPage") title = "Guides Page";
    else if (section === "homeContact") title = "Home Contact";
    else if (section === "productsPage") title = "Products Page";
    else title = "Home";
  }

  return <AdminShell title={title}>{children}</AdminShell>;
}

export default function PersistentAdminChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminShell title="Admin">{children}</AdminShell>}>
      <ChromeInner>{children}</ChromeInner>
    </Suspense>
  );
}
