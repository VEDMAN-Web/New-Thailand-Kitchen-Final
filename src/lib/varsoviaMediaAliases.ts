/**
 * Same path aliases as Varsovia frontend `lib/mediaAssets.ts`.
 * CMS still stores legacy paths like `/home/featured-project/feature-1.jpg`
 * while files live under `/home/featured/feature-1.jpg`.
 */

const ALIASES: Record<string, string> = {
  "/home/catalog-1.jpg": "/home/catalog/catalog-2.jpg",
  "/home/product/product-3.jpg": "/home/product/product-3.jpg",
  "/home/home-front-page.png": "/home/hero.jpg",
  "/home/home-front-page.jpg": "/home/hero.jpg",
  "/home/counting.png": "/home/stats.jpg",
  "/home/counting.jpg": "/home/stats.jpg",
  "/home/about-1.png": "/home/about-1.jpg",
  "/home/about-2.png": "/home/about-2.jpg",
  "/home/about-3.png": "/home/about-3.jpg",
  "/home/product/product-1.png": "/home/product/product-1.jpg",
  "/home/product/product-2.png": "/home/product/product-2.jpg",
  "/home/catalog.png": "/home/catalog/catalog-1.jpg",
  "/home/catalog-2.png": "/home/catalog/catalog-2.jpg",
  "/home/catalog-3.png": "/home/catalog/catalog-3.jpg",
  "/home/catalog-4.png": "/home/catalog/catalog-4.jpg",
  "/team/team.png": "/team/team.jpg",
  "/blog/blog1.png": "/blog/blog1.jpg",
  "/Interior-kitchen/kitchen1.png": "/Interior-kitchen/kitchen1.jpg",
  "/Interior-kitchen/kitchen2.png": "/Interior-kitchen/kitchen2.jpg",
};

for (let i = 1; i <= 8; i += 1) {
  const featured = `/home/featured/feature-${i}.jpg`;
  ALIASES[`/home/featured-project/feature-${i}.jpg`] = featured;
  ALIASES[`/home/featured-project/feature-${i}.png`] = featured;
}

for (let i = 1; i <= 7; i += 1) {
  ALIASES[`/home/stories/story-${i}.jpg`] = `/home/stories/story-${i}.jpg`;
}

/** Last-resort admin previews when local /public files are not downloaded. */
const REMOTE_PREVIEWS: Record<string, string> = {
  "/home/hero.jpg":
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
  "/home/stats.jpg":
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80",
  "/home/about-1.jpg":
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=900&q=80",
  "/home/about-2.jpg":
    "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=900&q=80",
  "/home/about-3.jpg":
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80",
  "/home/product/product-1.jpg":
    "https://images.unsplash.com/photo-1600047509800-ba049702a1bf?auto=format&fit=crop&w=900&q=80",
  "/home/product/product-2.jpg":
    "https://images.unsplash.com/photo-1600121848594-a7844984459c?auto=format&fit=crop&w=900&q=80",
  "/home/product/product-3.jpg":
    "https://images.unsplash.com/photo-1600566753190-17f19bb0c243?auto=format&fit=crop&w=900&q=80",
  "/Interior-kitchen/kitchen1.jpg":
    "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1000&q=80",
  "/Interior-kitchen/kitchen2.jpg":
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
  "/team/team.jpg":
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
  "/blog/blog1.jpg":
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
};

for (let i = 1; i <= 5; i += 1) {
  REMOTE_PREVIEWS[`/home/catalog/catalog-${i}.jpg`] =
    `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80`;
}
for (let i = 1; i <= 8; i += 1) {
  REMOTE_PREVIEWS[`/home/featured/feature-${i}.jpg`] =
    `https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1200&q=80`;
}
for (let i = 1; i <= 7; i += 1) {
  REMOTE_PREVIEWS[`/home/stories/story-${i}.jpg`] =
    `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80`;
  REMOTE_PREVIEWS[`/home/contact/contact-${i}.jpg`] =
    `https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80`;
}

const PARTNER_LOGO_ALIASES: Record<string, string> = {
  "/partners/figma/fischer.png": "/partners/fischer-mask.svg",
  "/partners/figma/bostik.png": "/partners/bostik-mask.svg",
  "/partners/figma/egger.png": "/partners/egger-mask.svg",
  "/partners/figma/blum.png": "/partners/blum.svg",
  "/partners/figma/jowat.png": "/partners/jowat-mask.svg",
  "/partners/figma/emblem.png": "/partners/partner-emblem-mask.svg",
  "/partners/fischer.png": "/partners/fischer-mask.svg",
  "/partners/bostik.png": "/partners/bostik-mask.svg",
  "/partners/egger.png": "/partners/egger-mask.svg",
  "/partners/blum.png": "/partners/blum.svg",
  "/partners/jowat.png": "/partners/jowat-mask.svg",
  "/partners/emblem.png": "/partners/partner-emblem-mask.svg",
};

Object.assign(ALIASES, PARTNER_LOGO_ALIASES);

const VARSOVIA_PUBLIC_PREFIXES = [
  "/home/",
  "/team/",
  "/quality-sale/",
  "/Interior-kitchen/",
  "/blog/blog",
  "/partners/",
];

/** Same-origin admin prefix rewritten to the Varsovia frontend in next.config. */
export const VARSOVIA_STATIC_PREFIX = "/varsovia-static";

function normalizeKey(path: string): string {
  const raw = path.split("?")[0].split("#")[0];
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export function aliasVarsoviaMediaPath(path: string): string {
  const key = normalizeKey(path);
  return ALIASES[key] || path;
}

const KITCHEN_ASSET = /^\/products\/Kitchen(\d)\.(png|jpe?g|webp)$/i;

const VARSOVIA_PRODUCT_PHOTOS = [
  "/home/product/product-1.jpg",
  "/home/product/product-2.jpg",
  "/home/product/product-3.jpg",
];

/**
 * Thailand Kitchen stock paths (`/products/Kitchen2.jpg`) do not exist on
 * Varsovia. Map them to Varsovia public photos so admin previews work.
 */
export function mapThailandKitchenPathToVarsovia(path: string): string {
  const key = normalizeKey(path);
  const match = key.match(KITCHEN_ASSET);
  if (!match) return key;
  const index = Number(match[1]) - 1;
  if (index >= 0 && index < VARSOVIA_PRODUCT_PHOTOS.length) {
    return VARSOVIA_PRODUCT_PHOTOS[index];
  }
  const featured = ((index % 8) + 8) % 8;
  return `/home/featured/feature-${featured + 1}.jpg`;
}

export function canonicalizeVarsoviaPreviewPath(path: string): string {
  return mapThailandKitchenPathToVarsovia(aliasVarsoviaMediaPath(path));
}

export function isVarsoviaPublicAssetPath(path: string): boolean {
  const p = normalizeKey(path);
  return VARSOVIA_PUBLIC_PREFIXES.some((prefix) => p.startsWith(prefix));
}

function partnerLogoCandidates(path: string): string[] {
  const key = normalizeKey(path);
  if (!key.startsWith("/partners/")) return [];
  const stem = key
    .replace(/^\/partners\//, "")
    .replace(/^figma\//, "")
    .replace(/\.[^.]+$/, "")
    .replace(/-mask$/, "");
  const names =
    stem === "emblem" || stem === "partner-emblem"
      ? ["partner-emblem", "emblem"]
      : [stem];
  const out: string[] = [];
  for (const name of names) {
    out.push(`/partners/${name}.svg`);
    out.push(`/partners/${name}-mask.svg`);
    out.push(`/partners/${name}.png`);
    out.push(`/partners/figma/${name}.png`);
  }
  return out;
}

/** Local + aliased variants. Prefer the canonical file path; skip extension spray. */
export function varsoviaMediaPathCandidates(path: string): string[] {
  const key = normalizeKey(path);
  const aliased = aliasVarsoviaMediaPath(key);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of [aliased, key, ...partnerLogoCandidates(key), ...partnerLogoCandidates(aliased)]) {
    if (candidate && !seen.has(candidate)) {
      seen.add(candidate);
      out.push(candidate);
    }
  }
  return out;
}

export function varsoviaRemotePreviewUrl(path: string): string {
  for (const candidate of varsoviaMediaPathCandidates(path)) {
    const remote = REMOTE_PREVIEWS[normalizeKey(candidate)];
    if (remote) return remote;
  }
  return "";
}
