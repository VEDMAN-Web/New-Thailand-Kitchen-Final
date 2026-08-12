import Link from "next/link";
import JsonLd from "./JsonLd";
import { absoluteUrl, SITE_ORIGIN } from "../../lib/siteUrl";

type BreadcrumbItem = {
  label: string;
  href: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  currentPage: string;
  /** Canonical path or absolute URL for the current page (JSON-LD). */
  currentHref?: string;
};

export default function Breadcrumbs({
  items,
  currentPage,
  currentHref,
}: BreadcrumbsProps) {
  const currentUrl = currentHref
    ? currentHref.startsWith("http")
      ? currentHref
      : absoluteUrl(currentHref)
    : SITE_ORIGIN;

  const jsonLdItems = [
    ...items.map((item) => ({
      name: item.label,
      url: absoluteUrl(item.href),
    })),
    {
      name: currentPage,
      url: currentUrl,
    },
  ];

  return (
    <>
      <JsonLd type="Breadcrumb" data={{ items: jsonLdItems }} />

      <nav aria-label="Breadcrumb" className="py-4 px-4 md:px-8 lg:px-16">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <Link
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
              <span className="text-gray-400">/</span>
            </li>
          ))}
          <li className="text-gray-900 font-medium">{currentPage}</li>
        </ol>
      </nav>
    </>
  );
}

export type { BreadcrumbItem, BreadcrumbsProps };
