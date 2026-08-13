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
  locale: LocaleCode = "en",
  options?: { strict?: boolean }
): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const map = value as Partial<Record<LocaleCode, unknown>>;
    const raw =
      typeof map[locale] === "string" ? String(map[locale]).trim() : "";
    if (options?.strict) {
      if (raw) return raw;
      return locale === "en" && typeof map.en === "string"
        ? String(map.en).trim()
        : "";
    }
    if (raw) return raw;
    return typeof map.en === "string" ? String(map.en).trim() : "";
  }
  return "";
}

/** True when the UI is showing English copy on a non-English tab. */
export function isLocaleFallback(value: unknown, locale: LocaleCode): boolean {
  if (locale === "en") return false;
  if (typeof value === "string") return false;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const map = value as Partial<Record<LocaleCode, unknown>>;
  const localized =
    typeof map[locale] === "string" ? String(map[locale]).trim() : "";
  const en = typeof map.en === "string" ? String(map.en).trim() : "";
  return !localized && Boolean(en);
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
    const en = String((value as any).en ?? "").trim() || fallbackEn;
    return {
      en,
      th: String((value as any).th ?? "").trim() || en,
      pl: String((value as any).pl ?? "").trim() || en,
    };
  }
  if (typeof value === "string" && value.trim()) {
    const en = value.trim();
    return { en, th: en, pl: en };
  }
  return { en: fallbackEn, th: fallbackEn, pl: fallbackEn };
}

export function hasLocalizedText(value: unknown): boolean {
  return Boolean(localizedValue(value, "en").trim()) ||
    Boolean(localizedValue(value, "th").trim()) ||
    Boolean(localizedValue(value, "pl").trim());
}
