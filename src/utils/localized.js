/**
 * Varsovia-style localized text helpers for Thailand Kitchen CMS.
 * Shape: { en, th, pl }. Plain strings normalize to { en: string, th: "", pl: "" }.
 */

function asLocalized(value, fallbackEn = "") {
  const fb = String(fallbackEn || "").trim();
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const hasLocaleKey =
      "en" in value || "th" in value || "pl" in value;
    if (hasLocaleKey) {
      const en = String(value.en ?? "").trim() || fb;
      const th = String(value.th ?? "").trim();
      const pl = String(value.pl ?? "").trim();
      return { en, th, pl };
    }
  }
  if (typeof value === "string" && value.trim()) {
    return { en: value.trim(), th: "", pl: "" };
  }
  return { en: fb, th: "", pl: "" };
}

/** Merge current with fallback; prefer non-empty current per locale.
 * Legacy EN-only strings that still match the default EN inherit default th/pl.
 * Custom EN copy keeps empty th/pl until the admin fills them (public falls back to en).
 */
function mergeLocalized(current, fallback) {
  const fb = asLocalized(fallback);
  const cur = asLocalized(current);
  if (!cur.en && !cur.th && !cur.pl) return fb;
  if (cur.en && !cur.th && !cur.pl && cur.en === fb.en) {
    return { en: cur.en, th: fb.th, pl: fb.pl };
  }
  return {
    en: cur.en || fb.en,
    th: cur.th,
    pl: cur.pl,
  };
}

/**
 * For page chrome (heroes, nav-adjacent labels): fill empty th/pl from defaults
 * even when EN was customized, so language switch never shows blank chrome.
 * Admin-authored th/pl still win.
 */
function mergeLocalizedFillEmpty(current, fallback) {
  const fb = asLocalized(fallback);
  const cur = asLocalized(current);
  if (!cur.en && !cur.th && !cur.pl) return fb;
  const take = (loc) => {
    const saved = String(cur[loc] || "").trim();
    const seed = String(fb[loc] || "").trim();
    if (saved && saved !== cur.en) return saved;
    return seed || saved;
  };
  return {
    en: cur.en || fb.en,
    th: take("th"),
    pl: take("pl"),
  };
}

/** Build localized map from three strings. */
function L(en, th = "", pl = "") {
  return {
    en: String(en || "").trim(),
    th: String(th || "").trim(),
    pl: String(pl || "").trim(),
  };
}

function localeKey(locale) {
  const s = String(locale || "en").toLowerCase();
  if (s === "th") return "th";
  if (s === "pl") return "pl";
  return "en";
}

function localizedString(value, locale = "en") {
  const map = asLocalized(value);
  const key = localeKey(locale);
  return map[key] || map.en || "";
}

function fillEmptyLocalesFromEn(value) {
  // Empty th/pl must stay empty so admin tabs and live /th /pl stay independent.
  // Public reads fall back to English at render time when a locale is blank.
  return asLocalized(value);
}

/** True if any locale has text (or legacy string). */
function hasLocalizedText(value) {
  if (typeof value === "string") return Boolean(value.trim());
  if (value && typeof value === "object") {
    return Boolean(
      String(value.en || "").trim() ||
        String(value.th || "").trim() ||
        String(value.pl || "").trim()
    );
  }
  return false;
}

module.exports = {
  asLocalized,
  mergeLocalized,
  mergeLocalizedFillEmpty,
  fillEmptyLocalesFromEn,
  L,
  localeKey,
  localizedString,
  hasLocalizedText,
};
