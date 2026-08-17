import { localizedValue } from "@/lib/localized";

/** Same labels as the live /products chips. */
export const CANONICAL_PRODUCT_CATEGORIES = [
  "Modern",
  "Islands",
  "U Shape",
  "L Shape",
  "Straight",
  "T Shape",
] as const;

export function normalizeCategoryKey(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "-");
}

const CANONICAL_LABEL_BY_KEY: Record<string, string> = {
  modern: "Modern",
  islands: "Islands",
  "u-shape": "U Shape",
  "l-shape": "L Shape",
  straight: "Straight",
  "t-shape": "T Shape",
  "best-seller": "Best Seller",
  bestseller: "Best Seller",
};

export function canonicalCategoryLabel(raw: string): string {
  const trimmed = String(raw || "")
    .trim()
    .replace(/\s+/g, " ");
  if (!trimmed) return "";
  return CANONICAL_LABEL_BY_KEY[normalizeCategoryKey(trimmed)] || trimmed;
}

export function collectProductCategoryLabels(extraLabels: Iterable<string> = []): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string) => {
    const label = canonicalCategoryLabel(raw);
    if (!label) return;
    const key = normalizeCategoryKey(label);
    if (!key || key === "all" || key === "best-seller" || key === "bestseller") return;
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(label);
  };
  for (const label of CANONICAL_PRODUCT_CATEGORIES) push(label);
  for (const label of extraLabels) push(label);
  return ordered;
}

export function categoryTitleEn(cat: { title?: unknown }): string {
  return localizedValue(cat.title, "en").trim();
}
