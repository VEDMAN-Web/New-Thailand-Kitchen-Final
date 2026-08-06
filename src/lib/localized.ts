/** Varsovia-style localized text for Thailand Kitchen admin CMS. */
export type LocaleCode = "en" | "th" | "pl";

export type LocalizedText =
  | string
  | Partial<Record<LocaleCode, string>>;

export const CMS_LOCALES: { id: LocaleCode; label: string }[] = [
  { id: "en", label: "English" },
  { id: "th", label: "Thai" },
  { id: "pl", label: "Polish" },
];

export function localizedValue(
  value: unknown,
  locale: LocaleCode = "en"
): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const map = value as Partial<Record<LocaleCode, unknown>>;
    const resolved = map[locale] ?? map.en;
    return typeof resolved === "string" ? resolved : "";
  }
  return "";
}

export function writeLocalized(
  current: unknown,
  locale: LocaleCode,
  value: string
): Record<LocaleCode, string> {
  const base =
    current && typeof current === "object" && !Array.isArray(current)
      ? {
          en: String((current as any).en ?? ""),
          th: String((current as any).th ?? ""),
          pl: String((current as any).pl ?? ""),
        }
      : {
          en: typeof current === "string" ? current : "",
          th: "",
          pl: "",
        };
  return { ...base, [locale]: value };
}

export function emptyLocalized(): Record<LocaleCode, string> {
  return { en: "", th: "", pl: "" };
}

export function asLocalizedForm(
  value: unknown,
  fallbackEn = ""
): Record<LocaleCode, string> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      en: String((value as any).en ?? "").trim() || fallbackEn,
      th: String((value as any).th ?? "").trim(),
      pl: String((value as any).pl ?? "").trim(),
    };
  }
  if (typeof value === "string" && value.trim()) {
    return { en: value.trim(), th: "", pl: "" };
  }
  return { en: fallbackEn, th: "", pl: "" };
}

export function hasLocalizedText(value: unknown): boolean {
  return Boolean(localizedValue(value, "en").trim()) ||
    Boolean(localizedValue(value, "th").trim()) ||
    Boolean(localizedValue(value, "pl").trim());
}
