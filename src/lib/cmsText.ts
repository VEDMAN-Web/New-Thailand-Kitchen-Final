/**
 * Prefer CMS localized map for the active locale (Varsovia-style).
 * Fallback: locale → en → i18n fallback.
 * Legacy plain strings: EN uses CMS; TH/PL prefer i18n then EN CMS.
 */
import type { Locale } from "../i18n/translations";

function localeKey(locale: Locale): "en" | "th" | "pl" {
  if (locale === "TH") return "th";
  if (locale === "PL") return "pl";
  return "en";
}

export function pickCmsText(
  cmsValue: unknown,
  fallback: string,
  locale: Locale = "EN"
): string {
  const key = localeKey(locale);

  if (cmsValue && typeof cmsValue === "object" && !Array.isArray(cmsValue)) {
    const map = cmsValue as Partial<Record<"en" | "th" | "pl", unknown>>;
    const localized =
      typeof map[key] === "string" ? String(map[key]).trim() : "";
    const en = typeof map.en === "string" ? map.en.trim() : "";
    return localized || en || fallback;
  }

  const value = typeof cmsValue === "string" ? cmsValue.trim() : "";
  if (locale !== "EN") {
    // Legacy unmigrated string = English-only CMS; prefer i18n for TH/PL
    return fallback || value;
  }
  return value || fallback;
}

/** Always prefer CMS for non-translated assets (images, videos, emails, phones). */
export function pickCmsAsset(
  cmsValue: unknown,
  fallback: string = ""
): string {
  if (typeof cmsValue === "string") {
    const value = cmsValue.trim();
    return value || fallback;
  }
  // Accidental localized map → use EN
  if (cmsValue && typeof cmsValue === "object" && !Array.isArray(cmsValue)) {
    const map = cmsValue as Partial<Record<"en" | "th" | "pl", unknown>>;
    const en = typeof map.en === "string" ? map.en.trim() : "";
    return en || fallback;
  }
  return fallback;
}

/**
 * Guarantee a React-safe string. Never returns an object.
 * Prefer pickCmsText when locale matters; use this as a last-line guard.
 */
export function ensureCmsString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim() || fallback;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const map = value as Partial<Record<"en" | "th" | "pl", unknown>>;
    if (typeof map.en === "string" && map.en.trim()) return map.en.trim();
    if (typeof map.th === "string" && map.th.trim()) return map.th.trim();
    if (typeof map.pl === "string" && map.pl.trim()) return map.pl.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}
