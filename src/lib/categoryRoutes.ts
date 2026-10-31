/** Canonical public paths for CMS category types — keep in sync with admin Live URL preview. */

import { tx, type Locale, type TranslationKey } from "../i18n/translations";

export type CategoryType =
  | "service"
  | "material"
  | "style"
  | "layout"
  | "property-type"
  | "location"
  | "built-in-furniture"
  | string;

export function categoryPublicBasePath(categoryType: CategoryType): string {
  switch (categoryType) {
    case "service":
      return "/services";
    case "material":
      return "/materials";
    case "style":
      return "/kitchens/styles";
    case "layout":
      return "/kitchens/layouts";
    case "property-type":
      return "/kitchens/by-property";
    case "location":
      return "/locations";
    case "built-in-furniture":
      return "/built-in-furniture";
    default:
      return "/products";
  }
}

/**
 * Resolve the public path for a category.
 * Location × service children: /locations/{parentSlug}/{serviceSlug}
 */
export function categoryPublicPath(category: {
  categoryType?: string | null;
  slug?: string | null;
  parentId?:
    | string
    | { slug?: string | null; categoryType?: string | null }
    | null;
}): string {
  const slug = String(category.slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
  if (!slug) return categoryPublicBasePath(category.categoryType || "");

  const parent =
    category.parentId && typeof category.parentId === "object"
      ? category.parentId
      : null;
  const parentSlug = String(parent?.slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

  if (
    category.categoryType === "service" &&
    parent?.categoryType === "location" &&
    parentSlug
  ) {
    return `/locations/${parentSlug}/${slug}`;
  }

  return `${categoryPublicBasePath(category.categoryType || "")}/${slug}`;
}

function sectionLabelKey(categoryType: CategoryType): TranslationKey {
  switch (categoryType) {
    case "service":
      return "nav.services";
    case "material":
      return "nav.materials";
    case "style":
      return "hub.styles";
    case "layout":
      return "hub.layouts";
    case "property-type":
      return "hub.byProperty";
    case "location":
      return "nav.locations";
    case "built-in-furniture":
      return "nav.builtInFurniture";
    default:
      return "nav.products";
  }
}

export function categorySectionLabel(
  categoryType: CategoryType,
  locale: Locale = "EN"
): string {
  return tx(locale, sectionLabelKey(categoryType));
}

export function categoryBreadcrumbTrail(
  categoryType: CategoryType,
  opts?: {
    locationSlug?: string;
    locationTitle?: string;
    locale?: Locale;
  }
): { label: string; href: string }[] {
  const locale = opts?.locale ?? "EN";
  const home = { label: tx(locale, "nav.home"), href: "/" };
  const kitchens = { label: tx(locale, "nav.kitchens"), href: "/kitchens" };
  switch (categoryType) {
    case "layout":
      return [
        home,
        kitchens,
        { label: tx(locale, "hub.layouts"), href: "/kitchens/layouts" },
      ];
    case "style":
      return [
        home,
        kitchens,
        { label: tx(locale, "hub.styles"), href: "/kitchens/styles" },
      ];
    case "property-type":
      return [
        home,
        kitchens,
        {
          label: tx(locale, "hub.byProperty"),
          href: "/kitchens/by-property",
        },
      ];
    case "built-in-furniture":
      return [
        home,
        {
          label: tx(locale, "nav.builtInFurniture"),
          href: "/built-in-furniture",
        },
      ];
    case "service":
      if (opts?.locationSlug) {
        return [
          home,
          { label: tx(locale, "nav.locations"), href: "/locations" },
          {
            label: opts.locationTitle || opts.locationSlug,
            href: `/locations/${opts.locationSlug}`,
          },
        ];
      }
      return [
        home,
        { label: tx(locale, "nav.services"), href: "/services" },
      ];
    case "material":
      return [
        home,
        { label: tx(locale, "nav.materials"), href: "/materials" },
      ];
    case "location":
      return [
        home,
        { label: tx(locale, "nav.locations"), href: "/locations" },
      ];
    default:
      return [
        home,
        { label: tx(locale, "nav.products"), href: "/products" },
      ];
  }
}
