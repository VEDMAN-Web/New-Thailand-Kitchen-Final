/** Mirrors public site nav hubs — keep in sync with thailand-kitchen-frontend hubNavigation. */

export type AdminHubKey =
  | "kitchens"
  | "services"
  | "materials"
  | "locations"
  | "builtInFurniture";

export type AdminHubMeta = {
  key: AdminHubKey;
  /** URL query value: /categories?hub=… */
  hubParam: string;
  label: string;
  sitePath: string;
  /** Category types belonging to this hub */
  categoryTypes: string[];
  /** Default type when adding a category from this hub view */
  defaultCategoryType: string;
  description: string;
};

export const ADMIN_HUBS: AdminHubMeta[] = [
  {
    key: "kitchens",
    hubParam: "kitchens",
    label: "Kitchens",
    sitePath: "/kitchens",
    categoryTypes: ["layout", "style", "property-type"],
    defaultCategoryType: "layout",
    description:
      "Mega-menu items under Kitchens (layouts, styles, by property) and their landing pages.",
  },
  {
    key: "services",
    hubParam: "services",
    label: "Services",
    sitePath: "/services",
    categoryTypes: ["service"],
    defaultCategoryType: "service",
    description:
      "Same pages as the Services mega-menu (top-level only).",
  },
  {
    key: "materials",
    hubParam: "materials",
    label: "Materials",
    sitePath: "/materials",
    categoryTypes: ["material"],
    defaultCategoryType: "material",
    description:
      "Same pages as the Materials mega-menu under /materials.",
  },
  {
    key: "locations",
    hubParam: "locations",
    label: "Locations",
    sitePath: "/locations",
    categoryTypes: ["location"],
    defaultCategoryType: "location",
    description:
      "Same cities as the Locations mega-menu on the site (/locations).",
  },
  {
    key: "builtInFurniture",
    hubParam: "built-in-furniture",
    label: "Built-In Furniture",
    sitePath: "/built-in-furniture",
    categoryTypes: ["built-in-furniture"],
    defaultCategoryType: "built-in-furniture",
    description: "Built-in furniture pages under /built-in-furniture.",
  },
];

export function adminHubByParam(param: string | null | undefined): AdminHubMeta | null {
  if (!param) return null;
  return ADMIN_HUBS.find((h) => h.hubParam === param) || null;
}

export function categoryTypeLabel(type: string): string {
  switch (type) {
    case "layout":
      return "Layout";
    case "style":
      return "Style";
    case "property-type":
      return "By property";
    case "service":
      return "Service";
    case "material":
      return "Material";
    case "location":
      return "Location";
    case "built-in-furniture":
      return "Built-in";
    default:
      return type || "Other";
  }
}
