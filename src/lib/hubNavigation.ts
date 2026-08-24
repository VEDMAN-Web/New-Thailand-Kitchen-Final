import type { CategoryType } from "./categoryRoutes";
import type { KitchensSectionKey } from "../components/kitchens/kitchensConfig";
import { KITCHENS_SECTIONS } from "../components/kitchens/kitchensConfig";

export type HubNavKey =
  | "kitchens"
  | "services"
  | "materials"
  | "locations"
  | "builtInFurniture";

export type HubNavConfig = {
  key: HubNavKey;
  href: string;
  navMatch: string;
  categoryTypes: CategoryType[];
  /** Kitchens uses grouped columns; others use a flat link grid. */
  layout: "grouped" | "flat";
  accent: string;
  fallbackTitle: string;
  fallbackDescription: string;
};

export const HUB_NAV_CONFIG: HubNavConfig[] = [
  {
    key: "kitchens",
    href: "/kitchens",
    navMatch: "/kitchens",
    categoryTypes: ["layout", "style", "property-type"],
    layout: "grouped",
    accent: "#B38B6D",
    fallbackTitle: "Kitchens",
    fallbackDescription:
      "Explore kitchen layouts, styles, and solutions by property type.",
  },
  {
    key: "services",
    href: "/services",
    navMatch: "/services",
    categoryTypes: ["service"],
    layout: "flat",
    accent: "#1A2332",
    fallbackTitle: "Services",
    fallbackDescription:
      "Kitchen design, installation, renovation, and related services.",
  },
  {
    key: "materials",
    href: "/materials",
    navMatch: "/materials",
    categoryTypes: ["material"],
    layout: "flat",
    accent: "#B38B6D",
    fallbackTitle: "Materials",
    fallbackDescription:
      "Cabinet materials, finishes, worktops, and hardware.",
  },
  {
    key: "locations",
    href: "/locations",
    navMatch: "/locations",
    categoryTypes: ["location"],
    layout: "flat",
    accent: "#2D6A4F",
    fallbackTitle: "Locations",
    fallbackDescription: "Kitchen projects and services across Thailand.",
  },
  {
    key: "builtInFurniture",
    href: "/built-in-furniture",
    navMatch: "/built-in-furniture",
    categoryTypes: ["built-in-furniture"],
    layout: "flat",
    accent: "#1A2332",
    fallbackTitle: "Built-In Furniture",
    fallbackDescription:
      "Wardrobes, closets, vanities, and other built-in furniture.",
  },
];

export function hubNavByHref(href: string): HubNavConfig | undefined {
  const normalized = href.replace(/\/+$/, "") || "/";
  return HUB_NAV_CONFIG.find((h) => h.href === normalized);
}

export function hubNavByKey(key: HubNavKey): HubNavConfig {
  return HUB_NAV_CONFIG.find((h) => h.key === key)!;
}

export function hubNavActive(pathname: string, config: HubNavConfig) {
  return (
    pathname === config.href || pathname.startsWith(`${config.href}/`)
  );
}

export type HubSectionBlock = {
  heading?: unknown;
  body?: unknown;
  image?: string;
  layout?: string;
};

export type HubPageCms = {
  title?: unknown;
  description?: unknown;
  eyebrow?: unknown;
  heroImage?: string;
  ctaLabel?: unknown;
  ctaHref?: string;
  metaTitle?: string;
  metaDescription?: string;
  sections?: HubSectionBlock[];
  subsections?: Partial<
    Record<
      KitchensSectionKey,
      {
        title?: unknown;
        description?: unknown;
        eyebrow?: unknown;
        heroImage?: string;
        sections?: HubSectionBlock[];
        ctaLabel?: unknown;
        ctaHref?: string;
        metaTitle?: string;
        metaDescription?: string;
      }
    >
  >;
};

export type HubPagesCms = Partial<Record<HubNavKey, HubPageCms>>;
