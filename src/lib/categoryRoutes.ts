/** Canonical public paths for CMS category types — keep in sync with admin Live URL preview. */

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

export function categorySectionLabel(categoryType: CategoryType): string {
  switch (categoryType) {
    case "service":
      return "Services";
    case "material":
      return "Materials";
    case "style":
      return "Styles";
    case "layout":
      return "Layouts";
    case "property-type":
      return "By Property";
    case "location":
      return "Locations";
    case "built-in-furniture":
      return "Built-In Furniture";
    default:
      return "Products";
  }
}

export function categoryBreadcrumbTrail(
  categoryType: CategoryType,
  opts?: { locationSlug?: string; locationTitle?: string }
): { label: string; href: string }[] {
  const home = { label: "Home", href: "/" };
  switch (categoryType) {
    case "layout":
      return [
        home,
        { label: "Kitchens", href: "/kitchens" },
        { label: "Layouts", href: "/kitchens/layouts" },
      ];
    case "style":
      return [
        home,
        { label: "Kitchens", href: "/kitchens" },
        { label: "Styles", href: "/kitchens/styles" },
      ];
    case "property-type":
      return [
        home,
        { label: "Kitchens", href: "/kitchens" },
        { label: "By Property", href: "/kitchens/by-property" },
      ];
    case "built-in-furniture":
      return [home, { label: "Built-In Furniture", href: "/built-in-furniture" }];
    case "service":
      if (opts?.locationSlug) {
        return [
          home,
          { label: "Locations", href: "/locations" },
          {
            label: opts.locationTitle || opts.locationSlug,
            href: `/locations/${opts.locationSlug}`,
          },
        ];
      }
      return [home, { label: "Services", href: "/services" }];
    case "material":
      return [home, { label: "Materials", href: "/materials" }];
    case "location":
      return [home, { label: "Locations", href: "/locations" }];
    default:
      return [home, { label: "Products", href: "/products" }];
  }
}
