/**
 * Fill blank IA hub/child CMS fields from the live-site seed so the admin
 * panel mirrors /furniture, /locations/[city], etc. after Sync from DB.
 * Never overwrites copy that already exists in Mongo.
 * Sync fills each language tab from the live seed (including copy that is
 * still English on /th and /pl) so the panel matches the public site.
 */
import { isLocaleMap, mergeLocaleMapsFillLive } from "@/lib/localized";
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

function mergeObject(current: unknown, defaults: unknown): unknown {
  if (isLocaleMap(current) || isLocaleMap(defaults)) {
    return mergeLocaleMapsFillLive(current, defaults);
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
      out[key] = mergeObject(out[key], defaultValue);
    }
    return out;
  }
  return current;
}

function mergeSections(saved: unknown, defaults: unknown): unknown[] {
  const fallback = Array.isArray(defaults) ? clone(defaults) : [];
  if (!Array.isArray(saved) || saved.length === 0) return fallback;
  if (!saved.some(sectionHasContent)) return fallback;
  return saved.map((block, index) => {
    const def = Array.isArray(defaults) ? defaults[index] : undefined;
    if (!sectionHasContent(block) && def) return clone(def);
    const row = block && typeof block === "object" ? { ...(block as Dict) } : {};
    if (isBlank(row.text) && !isBlank(row.body)) row.text = row.body;
    if (def && typeof def === "object") {
      const d = def as Dict;
      row.heading = mergeObject(row.heading, d.heading);
      row.text = mergeObject(row.text, d.text);
      if (isBlank(row.image) && d.image) row.image = clone(d.image);
      if (isBlank(row.imagePosition) && d.imagePosition) row.imagePosition = d.imagePosition;
      if (isBlank(row.layout) && d.layout) row.layout = d.layout;
    }
    return row;
  });
}

const SKIP_FILL_KEYS = new Set([
  "slug",
  "image",
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

function mergeArticleOffer(saved: unknown, defaults: unknown): Dict | undefined {
  if (isBlank(saved) && isBlank(defaults)) return undefined;
  const s = saved && typeof saved === "object" ? (saved as Dict) : {};
  const d = defaults && typeof defaults === "object" ? (defaults as Dict) : {};
  const out = mergeObject(s, d) as Dict;
  if (isBlank(s.points)) out.points = clone(d.points);
  if (isBlank(s.image)) out.image = clone(d.image);
  if (isBlank(s.ctaHref)) out.ctaHref = d.ctaHref || "/contact";
  return out;
}

function mergeChild(saved: unknown, defaults: unknown): Dict {
  const s = saved && typeof saved === "object" ? (saved as Dict) : {};
  const d = defaults && typeof defaults === "object" ? (defaults as Dict) : {};
  const out = mergeObject(s, d) as Dict;
  out.slug = String(s.slug || d.slug || "");
  out.hero = mergeObject(s.hero, d.hero);
  out.sections = mergeSections(s.sections, d.sections);
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
  return fillEmptyLocaleTabs(out) as Dict;
}

function mergeHub(saved: unknown, defaults: unknown): Dict {
  const s = saved && typeof saved === "object" ? (saved as Dict) : {};
  const d = defaults && typeof defaults === "object" ? (defaults as Dict) : {};
  const { children: _sc, ...savedRest } = s;
  const { children: defChildren, ...defRest } = d;
  const out = mergeObject(savedRest, defRest) as Dict;
  out.slug = String(d.slug || s.slug || "");
  out.hero = mergeObject(s.hero, d.hero);
  out.sections = mergeSections(s.sections, d.sections);
  out.articleContact = mergeObject(s.articleContact, d.articleContact);
  out.articleOffer = mergeArticleOffer(s.articleOffer, d.articleOffer);
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
    const slug = String((child as Dict).slug || "").trim();
    if (!slug) continue;
    bySlug.set(slug, { ...(child as Dict), slug });
  }
  const children = defaultChildren.map((defChild) => {
    const def = defChild && typeof defChild === "object" ? (defChild as Dict) : {};
    return mergeChild(bySlug.get(String(def.slug || "")), def);
  });
  for (const extra of savedChildren) {
    const slug =
      extra && typeof extra === "object" ? String((extra as Dict).slug || "").trim() : "";
    if (slug && !children.some((c) => c.slug === slug)) {
      children.push(mergeChild({ ...(extra as Dict), slug }, { slug }));
    }
  }
  out.children = children;
  return fillEmptyLocaleTabs(out) as Dict;
}

const LIVE_DEFAULTS = LIVE_IA_PAGES as Record<string, unknown>;

/** Deep-fill `site.pages` from live IA seed. Existing CMS copy wins. */
export function mergeIaPagesFromLiveSite(pages: unknown): Record<string, unknown> {
  const current = pages && typeof pages === "object" ? (pages as Record<string, unknown>) : {};
  const out: Record<string, unknown> = { ...current };
  for (const [hubKey, defHub] of Object.entries(LIVE_DEFAULTS)) {
    out[hubKey] = mergeHub(current[hubKey], defHub);
  }
  return out;
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

/** Replace one IA hub with the live-site seed (Sync from DB on that hub page). */
export function replaceIaHubFromLiveSeed(
  pages: unknown,
  hubKey: string
): Record<string, unknown> {
  const current =
    pages && typeof pages === "object" && !Array.isArray(pages)
      ? { ...(pages as Record<string, unknown>) }
      : {};
  const def = liveHubDefault(hubKey);
  if (def) current[hubKey] = clone(def);
  return current;
}
