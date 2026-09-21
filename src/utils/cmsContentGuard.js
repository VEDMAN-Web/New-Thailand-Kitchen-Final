/**
 * Guard against smoke-test / probe strings leaking into public CMS content.
 * Also normalizes localhost upload URLs to site-relative paths.
 */

const PROBE_PATTERNS = [
  /HTML-PROBE/i,
  /SMOKE-TEST/i,
  /QA-PROBE/i,
  /__PROBE__/i,
  /CMS-ROUNDTRIP-/i,
];

function isProbeText(text) {
  const s = String(text || "").trim();
  if (!s) return false;
  return PROBE_PATTERNS.some((pattern) => pattern.test(s));
}

function localizedContainsProbe(value) {
  if (value == null) return false;
  if (typeof value === "string") return isProbeText(value);
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.values(value).some((entry) => isProbeText(entry));
  }
  return false;
}

function sectionContainsProbe(block) {
  if (!block || typeof block !== "object") return false;
  return (
    localizedContainsProbe(block.heading) ||
    localizedContainsProbe(block.body) ||
    localizedContainsProbe(block.title) ||
    localizedContainsProbe(block.description)
  );
}

function sectionsContainProbe(sections) {
  return Array.isArray(sections) && sections.some(sectionContainsProbe);
}

function sanitizeMediaUrl(url) {
  let s = String(url || "").trim();
  if (!s) return "";
  if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//i.test(s)) {
    s = s.replace(/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i, "");
  }
  const partnerPlaceholder = s.match(/\/brandLogo\/partner-(\d)\.svg$/i);
  if (partnerPlaceholder) return `/brandLogo/first (${partnerPlaceholder[1]}).png`;
  return s;
}

function isSupportedImageUrl(url) {
  const value = sanitizeMediaUrl(url);
  if (!value || /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(value)) {
    return false;
  }
  if (
    /^\/(uploads|brandLogo|products|product|features|blog|catlog|slider|testimonial|contactUs|footer|icon|gallery)\//i.test(value) ||
    /\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(value)
  ) {
    return true;
  }
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    const parsed = new URL(value);
    return (
      /\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(parsed.pathname + parsed.search + parsed.hash) ||
      /(^|\.)res\.cloudinary\.com$|(^|\.)images\.(pexels|unsplash)\.com$/i.test(parsed.hostname)
    );
  } catch {
    return false;
  }
}

function looksLikeMediaString(value) {
  const s = String(value || "");
  if (!s) return false;
  return (
    /\/(uploads|brandLogo|products|product|features|blog|catlog|slider|testimonial|contactUs|footer|icon|video|gallery)\//i.test(
      s
    ) ||
    /\.(png|jpe?g|webp|svg|gif|avif|mp4|webm)(\?|#|$)/i.test(s) ||
    /localhost|127\.0\.0\.1/i.test(s)
  );
}

function sanitizeMediaUrlsDeep(value) {
  if (value == null) return value;
  if (typeof value === "string") {
    return looksLikeMediaString(value) ? sanitizeMediaUrl(value) : value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeMediaUrlsDeep(entry));
  }
  if (typeof value === "object") {
    const next = {};
    for (const [key, entry] of Object.entries(value)) {
      next[key] = sanitizeMediaUrlsDeep(entry);
    }
    return next;
  }
  return value;
}

function findProbePath(value, path = "") {
  if (value == null) return null;
  if (typeof value === "string") {
    return isProbeText(value) ? path || "content" : null;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      const hit = findProbePath(value[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      const hit = findProbePath(entry, path ? `${path}.${key}` : key);
      if (hit) return hit;
    }
  }
  return null;
}

/**
 * Merge CMS sections with defaults; replace any probe block (or whole list) with defaults.
 */
function mergeContentSectionsSafe(src = [], def = []) {
  const list =
    Array.isArray(src) && src.length
      ? src
      : Array.isArray(def)
        ? def
        : [];

  if (sectionsContainProbe(list)) {
    return structuredClone(Array.isArray(def) ? def : []);
  }

  return list.map((block, index) => {
    const defBlock = def[index] || {};
    if (sectionContainsProbe(block)) {
      return {
        heading: defBlock.heading || "",
        body: defBlock.body || "",
        image: sanitizeMediaUrl(defBlock.image || ""),
        layout: String(defBlock.layout || "image-left").trim(),
      };
    }
    return {
      heading: block?.heading ?? defBlock?.heading ?? "",
      body: block?.body ?? defBlock?.body ?? "",
      image: sanitizeMediaUrl(block?.image || defBlock?.image || ""),
      layout: String(block?.layout || defBlock?.layout || "image-left").trim(),
    };
  });
}

function repairHubBlock(src = {}, def = {}) {
  const sections = sectionsContainProbe(src.sections)
    ? structuredClone(Array.isArray(def.sections) ? def.sections : [])
    : mergeContentSectionsSafe(src.sections, def.sections);

  const next = {
    ...src,
    sections,
    heroImage: sanitizeMediaUrl(src.heroImage || def.heroImage || ""),
  };

  for (const field of ["title", "description", "eyebrow", "ctaLabel"]) {
    if (localizedContainsProbe(src[field]) && def[field]) {
      next[field] = structuredClone(def[field]);
    }
  }

  return next;
}

function repairHubPages(hubPages = {}, defaults = {}) {
  const next = { ...hubPages };
  for (const key of Object.keys(defaults)) {
    const def = defaults[key] || {};
    const src = hubPages[key] || {};
    next[key] = repairHubBlock(src, def);

    if (key === "kitchens" && def.subsections) {
      const subsections = { ...(next[key].subsections || {}) };
      for (const subKey of Object.keys(def.subsections)) {
        subsections[subKey] = repairHubBlock(
          src.subsections?.[subKey] || {},
          def.subsections[subKey] || {}
        );
      }
      next[key].subsections = subsections;
    }
  }
  return next;
}

module.exports = {
  PROBE_PATTERNS,
  isProbeText,
  localizedContainsProbe,
  sectionContainsProbe,
  sectionsContainProbe,
  sanitizeMediaUrl,
  isSupportedImageUrl,
  sanitizeMediaUrlsDeep,
  findProbePath,
  mergeContentSectionsSafe,
  repairHubBlock,
  repairHubPages,
};
