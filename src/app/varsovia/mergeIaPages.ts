/**
 * Fill IA hub/child CMS fields from the live-site seed so the admin
 * panel mirrors the public pages after Sync. Blank photos and copy take
 * live values. Saved non-empty copy stays (it is already what live shows).
 */
import { isLocaleMap, mergeLocaleMaps, mergeLocaleMapsFillLive } from "@/lib/localized";
import LIVE_IA_PAGES from "./iaPagesSeed.json";

type Dict = Record<string, unknown>;

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    const values = Object.values(value as Dict);
    return values.length === 0 || values.every(isBlank);
  }
  return false;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function sectionHasContent(section: unknown): boolean {
  if (!section || typeof section !== "object") return false;
  const row = section as Dict;
  return !isBlank(row.heading) || !isBlank(row.text) || !isBlank(row.body) || !isBlank(row.image);
}

function mergeObject(current: unknown, defaults: unknown, fillLive = false): unknown {
  if (isLocaleMap(current) || isLocaleMap(defaults)) {
    return fillLive
      ? mergeLocaleMapsFillLive(current, defaults)
      : mergeLocaleMaps(current, defaults);
  }
  if (isBlank(current)) return clone(defaults);
  if (
    current &&
    defaults &&
    typeof current === "object" &&
    typeof defaults === "object" &&
    !Array.isArray(current) &&
    !Array.isArray(defaults)
  ) {
    const out: Dict = { ...(current as Dict) };
    for (const [key, defaultValue] of Object.entries(defaults as Dict)) {
      out[key] = mergeObject(out[key], defaultValue, fillLive);
    }
    return out;
  }
  return current;
}

function mergeSections(saved: unknown, defaults: unknown, fillLive = false): unknown[] {
  const fallback = Array.isArray(defaults) ? clone(defaults) : [];
  if (!Array.isArray(saved) || saved.length === 0) return fallback;
  if (!saved.some(sectionHasContent)) return fallback;
  const merged = saved.map((block, index) => {
    const def = Array.isArray(defaults) ? defaults[index] : undefined;
    if (!sectionHasContent(block) && def) return clone(def);
    const row = block && typeof block === "object" ? { ...(block as Dict) } : {};
    if (isBlank(row.text) && !isBlank(row.body)) row.text = row.body;
    if (def && typeof def === "object") {
      const d = def as Dict;
      row.heading = mergeObject(row.heading, d.heading, fillLive);
      row.text = mergeObject(row.text, d.text, fillLive);
      if (isBlank(row.image) && d.image) row.image = clone(d.image);
      if (isBlank(row.imagePosition) && d.imagePosition) row.imagePosition = d.imagePosition;
      if (isBlank(row.layout) && d.layout) row.layout = d.layout;
    }
    return row;
  });
  if (fallback.length > merged.length) {
    merged.push(...fallback.slice(merged.length).map((block) => clone(block)));
  }
  return merged;
}

const SKIP_FILL_KEYS = new Set([
  "slug",
  "ctaHref",
  "imagePosition",
  "layout",
  "href",
  "locationSlugs",
  "indexable",
  "order",
]);

/** Empty Thai/Polish tabs show the same copy live /th and /pl fall back to. */
function fillEmptyLocaleTabs(value: unknown, key = ""): unknown {
  if (SKIP_FILL_KEYS.has(key)) return value;
  if (isLocaleMap(value)) {
    const map = value as Dict;
    const en = String(map.en ?? "").trim();
    const th = String(map.th ?? "").trim();
    const pl = String(map.pl ?? "").trim();
    return { en, th: th || en, pl: pl || en };
  }
  if (Array.isArray(value)) {
    return value.map((item) => fillEmptyLocaleTabs(item, key));
  }
  if (value && typeof value === "object") {
    const out: Dict = { ...(value as Dict) };
    for (const [childKey, childValue] of Object.entries(out)) {
      out[childKey] = fillEmptyLocaleTabs(childValue, childKey);
    }
    return out;
  }
  return value;
}

function localeEn(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return String((value as Dict).en || "").trim();
  }
  return "";
}

/** Old seed used the same generic snippet on every city — treat as blank so Sync fills unique copy. */
function isStaleLocationMeta(value: unknown): boolean {
  const blob =
    typeof value === "string"
      ? value
      : value && typeof value === "object"
        ? Object.values(value as Dict)
            .map((v) => String(v || ""))
            .join(" ")
        : "";
  return /premium interiors and furniture craftsmanship across Thailand/i.test(
    blob,
  );
}

function mergeArticleOffer(saved: unknown, defaults: unknown, fillLive = false): Dict | undefined {
  if (isBlank(saved) && isBlank(defaults)) return undefined;
  const s = saved && typeof saved === "object" ? (saved as Dict) : {};
  const d = defaults && typeof defaults === "object" ? (defaults as Dict) : {};
  const out = mergeObject(s, d, fillLive) as Dict;
  if (isBlank(s.points)) out.points = clone(d.points);
  if (isBlank(s.image)) out.image = clone(d.image);
  if (isBlank(s.ctaHref)) out.ctaHref = d.ctaHref || "/contact";
  return out;
}

function applyLiveHeroImage(hero: unknown, liveHero: unknown): Dict {
  const h =
    hero && typeof hero === "object" && !Array.isArray(hero) ? { ...(hero as Dict) } : {};
  const live =
    liveHero && typeof liveHero === "object" && !Array.isArray(liveHero)
      ? (liveHero as Dict)
      : {};
  if (isBlank(h.image) && !isBlank(live.image)) h.image = clone(live.image);
  return h;
}

function mergeChild(saved: unknown, defaults: unknown, fillLive = false): Dict {
  const s = saved && typeof saved === "object" ? (saved as Dict) : {};
  const d = defaults && typeof defaults === "object" ? (defaults as Dict) : {};
  const out = mergeObject(s, d, fillLive) as Dict;
  out.slug = String(s.slug || d.slug || "");
  out.hero = applyLiveHeroImage(mergeObject(s.hero, d.hero, fillLive), d.hero);
  out.sections = mergeSections(s.sections, d.sections, fillLive);
  out.indexable = s.indexable === true;
  out.order = s.order ?? d.order ?? 0;
  if (Array.isArray(s.locationSlugs) && s.locationSlugs.length) {
    out.locationSlugs = s.locationSlugs;
  } else if (Array.isArray(d.locationSlugs)) {
    out.locationSlugs = clone(d.locationSlugs);
  }
  if (
    isStaleLocationMeta(out.metaDescription) &&
    !isBlank(d.metaDescription)
  ) {
    out.metaDescription = clone(d.metaDescription);
  }
  return fillLive ? (fillEmptyLocaleTabs(out) as Dict) : out;
}

function mergeHub(saved: unknown, defaults: unknown, fillLive = false): Dict {
  const s = saved && typeof saved === "object" ? (saved as Dict) : {};
  const d = defaults && typeof defaults === "object" ? (defaults as Dict) : {};
  const { children: _sc, ...savedRest } = s;
  const { children: defChildren, ...defRest } = d;
  const out = mergeObject(savedRest, defRest, fillLive) as Dict;
  out.slug = String(d.slug || s.slug || "");
  out.hero = applyLiveHeroImage(mergeObject(s.hero, d.hero, fillLive), d.hero);
  out.sections = mergeSections(s.sections, d.sections, fillLive);
  out.articleContact = mergeObject(s.articleContact, d.articleContact, fillLive);
  out.articleOffer = mergeArticleOffer(s.articleOffer, d.articleOffer, fillLive);
  out.indexable = s.indexable === true;

  const slug = String(out.slug || "");
  if (
    slug === "locations" ||
    slug === "about" ||
    slug === "complete-interiors" ||
    slug === "journal"
  ) {
    if (!localeEn(out.exploreTitle) || localeEn(out.exploreTitle) === "Explore") {
      out.exploreTitle = clone(d.exploreTitle);
    }
    if (
      !localeEn(out.exploreSubtitle) ||
      localeEn(out.exploreSubtitle) === "Choose a focus area to continue."
    ) {
      out.exploreSubtitle = clone(d.exploreSubtitle);
    }
  }

  const savedChildren = Array.isArray(s.children) ? s.children : [];
  const defaultChildren = Array.isArray(defChildren) ? defChildren : [];
  const bySlug = new Map<string, Dict>();
  for (const child of savedChildren) {
    if (!child || typeof child !== "object") continue;
    const childSlug = String((child as Dict).slug || "").trim();
    if (!childSlug) continue;
    bySlug.set(childSlug, { ...(child as Dict), slug: childSlug });
  }
  const children = defaultChildren.map((defChild) => {
    const def = defChild && typeof defChild === "object" ? (defChild as Dict) : {};
    return mergeChild(bySlug.get(String(def.slug || "")), def, fillLive);
  });
  for (const extra of savedChildren) {
    const extraSlug =
      extra && typeof extra === "object" ? String((extra as Dict).slug || "").trim() : "";
    if (extraSlug && !children.some((c) => c.slug === extraSlug)) {
      children.push(mergeChild({ ...(extra as Dict), slug: extraSlug }, { slug: extraSlug }, fillLive));
    }
  }
  out.children = children;
  return fillLive ? (fillEmptyLocaleTabs(out) as Dict) : out;
}

const LIVE_DEFAULTS = LIVE_IA_PAGES as Record<string, unknown>;

/** Deep-fill blank IA fields from seed. Saved CMS copy always wins. */
export function mergeIaPagesFromLiveSite(
  pages: unknown,
  opts?: { fillLive?: boolean }
): Record<string, unknown> {
  const fillLive = opts?.fillLive === true;
  const current = pages && typeof pages === "object" ? (pages as Record<string, unknown>) : {};
  const out: Record<string, unknown> = { ...current };
  for (const [hubKey, defHub] of Object.entries(LIVE_DEFAULTS)) {
    out[hubKey] = mergeHub(current[hubKey], defHub, fillLive);
  }
  return out;
}

/**
 * Sync one hub to match live (photos + copy). Blank fields take the live
 * snapshot. Saved non-empty copy stays because that is already on live.
 */
export function fillIaHubFromLiveSite(
  pages: unknown,
  hubKey: string
): Record<string, unknown> {
  const current =
    pages && typeof pages === "object" && !Array.isArray(pages)
      ? { ...(pages as Record<string, unknown>) }
      : {};
  const def = LIVE_DEFAULTS[hubKey];
  if (!def) return current;
  current[hubKey] = mergeHub(current[hubKey], def, true);
  return current;
}

export function liveChildDefault(hubKey: string, slug: string): Dict | null {
  const hub = LIVE_DEFAULTS[hubKey];
  if (!hub || typeof hub !== "object") return null;
  const kids = (hub as Dict).children;
  if (!Array.isArray(kids)) return null;
  const found = kids.find(
    (c) => c && typeof c === "object" && String((c as Dict).slug) === slug
  );
  return found && typeof found === "object" ? (found as Dict) : null;
}

export function liveHubDefault(hubKey: string): Dict | null {
  const hub = LIVE_DEFAULTS[hubKey];
  return hub && typeof hub === "object" ? (hub as Dict) : null;
}

/**
 * Replace one IA hub with the live-site seed (Sync from DB on that hub page).
 * Keeps the editor’s indexable flag so Sync does not silently un-index the URL.
 */
export function replaceIaHubFromLiveSeed(
  pages: unknown,
  hubKey: string
): Record<string, unknown> {
  const current =
    pages && typeof pages === "object" && !Array.isArray(pages)
      ? { ...(pages as Record<string, unknown>) }
      : {};
  const def = liveHubDefault(hubKey);
  if (def) {
    const existing = current[hubKey];
    const keepIndexable =
      existing && typeof existing === "object" && !Array.isArray(existing)
        ? (existing as Dict).indexable === true
        : false;
    current[hubKey] = clone(def);
    if (keepIndexable && current[hubKey] && typeof current[hubKey] === "object") {
      (current[hubKey] as Dict).indexable = true;
    }
  }
  return current;
}
