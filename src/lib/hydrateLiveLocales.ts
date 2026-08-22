import { isLocaleMap, type LocaleCode } from "@/lib/localized";

type Dict = Record<string, unknown>;

const SKIP_KEYS = new Set([
  "localeFlags",
  "key",
  "id",
  "slug",
  "href",
  "ctaHref",
  "featuredHref",
  "menuKind",
  "type",
  "layout",
  "imagePosition",
  "email",
  "phone",
  "order",
  "visible",
  "enabled",
  "indexable",
  "version",
  "step",
  "date",
  "mapEmbedUrl",
  "facebookUrl",
  "whatsappUrl",
  "instagramUrl",
  "xUrl",
  "mobileWhatsapp",
  "contactPhone",
]);

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function isPlainObject(value: unknown): value is Dict {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function looksLikeLocaleMap(value: unknown): boolean {
  if (isLocaleMap(value)) return true;
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((key) => key === "en" || key === "th" || key === "pl");
}

function shouldSkipKey(key: string): boolean {
  if (!key) return false;
  if (SKIP_KEYS.has(key)) return true;
  return /(href|url|pdf|video|embed|slug)$/i.test(key);
}

function isMediaKey(key: string): boolean {
  if (!key) return false;
  if (key === "localeFlags") return true;
  if (
    key === "heroImage" ||
    key === "statsImage" ||
    key === "image" ||
    key === "coverImage" ||
    key === "avatar" ||
    key === "logo" ||
    key === "downloadUrl" ||
    key === "pdfUrl"
  ) {
    return true;
  }
  return /(images?|icon|logo|avatar|cover|src)$/i.test(key);
}

function liveMediaString(overlay: unknown): string {
  if (typeof overlay === "string") return overlay.trim();
  if (typeof overlay === "number" && Number.isFinite(overlay)) return String(overlay);
  if (looksLikeLocaleMap(overlay)) {
    const map = overlay as Dict;
    return asString(map.en) || asString(map.th) || asString(map.pl);
  }
  return "";
}

function isLocalizableKey(key: string): boolean {
  if (!key || shouldSkipKey(key)) return false;
  if (key === "address") return false;
  if (/brandWordmark/i.test(key)) return true;
  return /(title|subtitle|label|text|body|heading|headline|eyebrow|name|quote|question|answer|description|intro|story|placeholder|copyright|bio|message|alt|privacy)$/i.test(
    key
  );
}

function isMediaLocaleMap(value: unknown, key: string): boolean {
  if (key === "localeFlags") return true;
  if (!looksLikeLocaleMap(value)) return false;
  const vals = Object.values(value as Dict).filter(
    (item) => typeof item === "string" && String(item).trim()
  ) as string[];
  if (!vals.length) return false;
  return vals.every(
    (item) =>
      /^https?:\/\//i.test(item) ||
      item.startsWith("/") ||
      /\.(png|jpe?g|webp|svg|gif|avif|pdf|ico)$/i.test(item)
  );
}

function overlayLeaf(overlay: unknown, locale: LocaleCode): string {
  if (typeof overlay === "string" || typeof overlay === "number") return asString(overlay);
  if (looksLikeLocaleMap(overlay)) return asString((overlay as Dict)[locale]);
  return "";
}

/**
 * Fill one locale tab from live copy.
 * Real translations win; live i18n wins next; last resort is whatever that locale URL shows.
 */
export function pickHydratedLocale(
  saved: unknown,
  live: unknown,
  en: string,
  options?: { fillFromEnglish?: boolean }
): string {
  const savedText = asString(saved);
  const liveText = asString(live);
  const english = en.trim();
  if (savedText && savedText !== english) return savedText;
  if (liveText && liveText !== english) return liveText;
  if (liveText) return liveText;
  if (savedText) return savedText;
  if (options?.fillFromEnglish && english) return english;
  return "";
}

function emptyMap(en = ""): Record<LocaleCode, string> {
  return { en, th: "", pl: "" };
}

function fillMap(
  map: Record<LocaleCode, string>,
  overlay: unknown,
  locale: "th" | "pl",
  fillFromEnglish: boolean
): Record<LocaleCode, string> {
  map[locale] = pickHydratedLocale(map[locale], overlayLeaf(overlay, locale), map.en, {
    fillFromEnglish,
  });
  return map;
}

function matchArrayOverlay(item: unknown, overlays: unknown[], index: number): unknown {
  const itemObj = isPlainObject(item) ? item : null;
  if (itemObj) {
    const href = asString(itemObj.href);
    const id = asString(itemObj.id);
    const slug = asString(itemObj.slug);
    const tabKey = asString(itemObj.tabKey);
    const key = asString(itemObj.key);
    const found = overlays.find((row) => {
      if (!isPlainObject(row)) return false;
      if (href && asString(row.href) === href) return true;
      if (id && asString(row.id) === id) return true;
      if (slug && asString(row.slug) === slug) return true;
      if (tabKey && asString(row.tabKey) === tabKey) return true;
      if (key && asString(row.key) === key) return true;
      return false;
    });
    if (found) return found;
  }
  return overlays[index];
}

function hydrateNode(
  cms: unknown,
  overlay: unknown,
  locale: "th" | "pl",
  fillFromEnglish: boolean,
  key = ""
): unknown {
  if (isMediaKey(key)) {
    if (typeof cms === "string") {
      if (cms.trim()) return cms;
      return liveMediaString(overlay) || cms;
    }
    if (Array.isArray(cms)) {
      const hasMedia = cms.some((item) => asString(item));
      if (hasMedia) return cms;
      if (Array.isArray(overlay) && overlay.length) return structuredClone(overlay);
      return cms;
    }
    if (isMediaLocaleMap(cms, key)) return cms;
  }

  if (shouldSkipKey(key) || isMediaLocaleMap(cms, key)) {
    return cms;
  }

  if (looksLikeLocaleMap(cms)) {
    const source = cms as Dict;
    return fillMap(
      {
        en: asString(source.en),
        th: asString(source.th),
        pl: asString(source.pl),
      },
      overlay,
      locale,
      fillFromEnglish
    );
  }

  if (typeof cms === "string" && isLocalizableKey(key)) {
    return fillMap(emptyMap(cms.trim()), overlay, locale, fillFromEnglish);
  }

  if (Array.isArray(cms)) {
    const overlayRows = Array.isArray(overlay) ? overlay : [];
    return cms.map((item, index) =>
      hydrateNode(item, matchArrayOverlay(item, overlayRows, index), locale, fillFromEnglish, key)
    );
  }

  if (isPlainObject(cms)) {
    const overlayObj = isPlainObject(overlay) ? overlay : {};
    const out: Dict = { ...cms };
    for (const childKey of Object.keys(out)) {
      out[childKey] = hydrateNode(
        out[childKey],
        overlayObj[childKey],
        locale,
        fillFromEnglish,
        childKey
      );
    }
    return out;
  }

  return cms;
}

function coerceStringOnlyFields<T>(value: T): T {
  if (!isPlainObject(value)) return value;
  const out: Dict = { ...value };
  for (const key of ["aboutImages", "aboutStoryImages", "contactImages"]) {
    if (!Array.isArray(out[key])) continue;
    out[key] = (out[key] as unknown[]).map((item) => {
      if (typeof item === "string") return item;
      if (looksLikeLocaleMap(item)) {
        const map = item as Dict;
        return asString(map.en) || asString(map.th) || asString(map.pl);
      }
      return item;
    });
  }
  if (Array.isArray(out.footerOffices)) {
    out.footerOffices = (out.footerOffices as Dict[]).map((office) => {
      if (!isPlainObject(office)) return office;
      const address = office.address;
      if (looksLikeLocaleMap(address)) {
        return {
          ...office,
          address:
            asString((address as Dict).en) ||
            asString((address as Dict).th) ||
            asString((address as Dict).pl),
        };
      }
      return office;
    });
  }
  return out as T;
}

/** Write live /th and /pl copy into matching CMS locale maps without wiping real translations. */
export function hydrateCmsFromLiveLocales<T>(
  cms: T,
  overlays: Partial<Record<"th" | "pl", unknown>>,
  options?: { fillFromEnglish?: boolean }
): T {
  const fillFromEnglish = options?.fillFromEnglish ?? true;
  let next: unknown = cms;
  for (const locale of ["th", "pl"] as const) {
    next = hydrateNode(next, overlays[locale], locale, fillFromEnglish);
  }
  return coerceStringOnlyFields(next) as T;
}

export function countFilledLocaleFields(before: unknown, after: unknown): number {
  let filled = 0;
  const walk = (prev: unknown, next: unknown) => {
    if (looksLikeLocaleMap(next) && !isMediaLocaleMap(next, "")) {
      const prevMap = looksLikeLocaleMap(prev)
        ? (prev as Dict)
        : typeof prev === "string"
          ? { en: prev, th: "", pl: "" }
          : {};
      const nextMap = next as Dict;
      for (const locale of ["th", "pl"] as const) {
        const was = asString(prevMap[locale]);
        const now = asString(nextMap[locale]);
        if (now && now !== was) filled += 1;
      }
      return;
    }
    if (Array.isArray(next)) {
      const prevArr = Array.isArray(prev) ? prev : [];
      next.forEach((item, index) => walk(prevArr[index], item));
      return;
    }
    if (isPlainObject(next)) {
      const prevObj = isPlainObject(prev) ? prev : {};
      for (const childKey of Object.keys(next)) walk(prevObj[childKey], next[childKey]);
    }
  };
  walk(before, after);
  return filled;
}
