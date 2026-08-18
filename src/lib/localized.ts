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

const LOCALE_KEYS = new Set<string>(["en", "th", "pl"]);

export function isLocaleMap(value: unknown): value is Partial<Record<LocaleCode, unknown>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value as object);
  if (!keys.length) return false;
  return keys.every((key) => LOCALE_KEYS.has(key));
}

export function localizedValue(
  value: unknown,
  locale: LocaleCode = "en",
  options?: { strict?: boolean }
): string {
  if (typeof value === "string") return locale === "en" || options?.strict === false ? value : "";
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const map = value as Partial<Record<LocaleCode, unknown>>;
    const raw =
      typeof map[locale] === "string" ? String(map[locale]).trim() : "";
    const strict = options?.strict ?? locale !== "en";
    if (strict) {
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
          en: String((current as Record<string, unknown>).en ?? ""),
          th: String((current as Record<string, unknown>).th ?? ""),
          pl: String((current as Record<string, unknown>).pl ?? ""),
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

/**
 * Normalize to `{ en, th, pl }` from stored CMS maps.
 * Tabs show whatever is saved for that locale (including live-synced copy).
 * Do not copy English into empty th/pl here — Sync from DB owns that fill.
 */
export function asLocalizedForm(
  value: unknown,
  fallbackEn = ""
): Record<LocaleCode, string> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const map = value as Record<string, unknown>;
    return {
      en: String(map.en ?? "").trim() || fallbackEn,
      th: String(map.th ?? "").trim(),
      pl: String(map.pl ?? "").trim(),
    };
  }
  if (typeof value === "string" && value.trim()) {
    return { en: value.trim(), th: "", pl: "" };
  }
  return { en: fallbackEn, th: "", pl: "" };
}

export function hasLocalizedText(value: unknown): boolean {
  return (
    Boolean(localizedValue(value, "en").trim()) ||
    Boolean(localizedValue(value, "th", { strict: true }).trim()) ||
    Boolean(localizedValue(value, "pl", { strict: true }).trim())
  );
}

export function localeFieldPlaceholder(locale: LocaleCode): string {
  if (locale === "th") return "Thai";
  if (locale === "pl") return "Polish";
  return "";
}

/** Keep a real translation; drop th/pl that were copied 1:1 from English. */
export function mergeLocaleMaps(current: unknown, defaults: unknown): Record<LocaleCode, string> {
  const c =
    typeof current === "string"
      ? { en: current, th: "", pl: "" }
      : current && typeof current === "object" && !Array.isArray(current)
        ? (current as Record<string, unknown>)
        : {};
  const d =
    typeof defaults === "string"
      ? { en: defaults, th: "", pl: "" }
      : defaults && typeof defaults === "object" && !Array.isArray(defaults)
        ? (defaults as Record<string, unknown>)
        : {};
  const en = String(c.en ?? "").trim() || String(d.en ?? "").trim();
  const take = (loc: "th" | "pl") => {
    const saved = String(c[loc] ?? "").trim();
    if (saved) return saved === en ? "" : saved;
    const seed = String(d[loc] ?? "").trim();
    const seedEn = String(d.en ?? "").trim();
    if (seed && seed !== seedEn) return seed;
    return "";
  };
  return { en, th: take("th"), pl: take("pl") };
}

/**
 * Sync-time merge: keep real translations, then fill remaining tabs from
 * the live seed (even when seed th/pl still equal English).
 */
export function mergeLocaleMapsFillLive(
  current: unknown,
  defaults: unknown
): Record<LocaleCode, string> {
  const c =
    typeof current === "string"
      ? { en: current, th: "", pl: "" }
      : current && typeof current === "object" && !Array.isArray(current)
        ? (current as Record<string, unknown>)
        : {};
  const d =
    typeof defaults === "string"
      ? { en: defaults, th: "", pl: "" }
      : defaults && typeof defaults === "object" && !Array.isArray(defaults)
        ? (defaults as Record<string, unknown>)
        : {};
  const en = String(c.en ?? "").trim() || String(d.en ?? "").trim();
  const take = (loc: "th" | "pl") => {
    const saved = String(c[loc] ?? "").trim();
    const seed = String(d[loc] ?? "").trim();
    const seedEn = String(d.en ?? "").trim();
    if (saved && saved !== en) return saved;
    if (seed && seed !== seedEn) return seed;
    if (saved) return saved;
    return seed;
  };
  return { en, th: take("th"), pl: take("pl") };
}

function sanitizeLocaleMap(map: Record<string, unknown>): Record<LocaleCode, string> {
  const en = String(map.en ?? "").trim();
  const th = String(map.th ?? "").trim();
  const pl = String(map.pl ?? "").trim();
  return {
    en,
    th: th && th !== en ? th : "",
    pl: pl && pl !== en ? pl : "",
  };
}

/**
 * Walk CMS payloads and clear th/pl that were duplicated from English so
 * Sync from DB / load puts each language in its own tab.
 */
export function sanitizeCopiedLocaleFallbacks<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeCopiedLocaleFallbacks(item)) as T;
  }
  if (!value || typeof value !== "object") return value;
  if (isLocaleMap(value)) {
    return sanitizeLocaleMap(value as Record<string, unknown>) as T;
  }
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    out[key] = sanitizeCopiedLocaleFallbacks(child);
  }
  return out as T;
}
