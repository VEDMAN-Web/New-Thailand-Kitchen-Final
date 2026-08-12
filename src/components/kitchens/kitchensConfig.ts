import type { CategoryType } from "../../lib/categoryRoutes";

export type KitchensSectionKey = "layouts" | "styles" | "byProperty";

export type KitchensSectionConfig = {
  key: KitchensSectionKey;
  categoryType: CategoryType;
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
  accentSoft: string;
};

/** Canonical kitchens IA — keep slugs aligned with admin Live URL preview. */
export const KITCHENS_SECTIONS: KitchensSectionConfig[] = [
  {
    key: "layouts",
    categoryType: "layout",
    href: "/kitchens/layouts",
    label: "Layouts",
    shortLabel: "Layout",
    description: "Island, U-shape, L-shape, galley, and other kitchen layouts.",
    accent: "#1A2332",
    accentSoft: "#E8E4DC",
  },
  {
    key: "styles",
    categoryType: "style",
    href: "/kitchens/styles",
    label: "Styles",
    shortLabel: "Style",
    description: "Modern, tropical, minimal, and heritage kitchen styles.",
    accent: "#B38B6D",
    accentSoft: "#F5E8DC",
  },
  {
    key: "byProperty",
    categoryType: "property-type",
    href: "/kitchens/by-property",
    label: "By Property",
    shortLabel: "Property",
    description: "Kitchen solutions for villas, condos, hotels, and developers.",
    accent: "#2D6A4F",
    accentSoft: "#E2F0E8",
  },
];

export function kitchensSectionByKey(key: KitchensSectionKey) {
  return KITCHENS_SECTIONS.find((s) => s.key === key);
}

export function kitchensSectionByPath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return KITCHENS_SECTIONS.find((s) => normalized.startsWith(s.href));
}
