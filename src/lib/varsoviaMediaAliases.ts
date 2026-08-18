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

const VARSOVIA_PUBLIC_PREFIXES = [
  "/home/",
  "/team/",
  "/quality-sale/",
  "/Interior-kitchen/",
  "/blog/blog",
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

export function isVarsoviaPublicAssetPath(path: string): boolean {
  const p = normalizeKey(path);
  return VARSOVIA_PUBLIC_PREFIXES.some((prefix) => p.startsWith(prefix));
}

function withSwappedExt(path: string): string[] {
  const out: string[] = [];
  if (/\.png$/i.test(path)) {
    out.push(path.replace(/\.png$/i, ".jpg"));
    out.push(path.replace(/\.png$/i, ".webp"));
    out.push(path.replace(/\.png$/i, ".jpeg"));
  } else if (/\.jpe?g$/i.test(path)) {
    out.push(path.replace(/\.jpe?g$/i, ".png"));
    out.push(path.replace(/\.jpe?g$/i, ".webp"));
  } else if (/\.webp$/i.test(path)) {
    out.push(path.replace(/\.webp$/i, ".jpg"));
    out.push(path.replace(/\.webp$/i, ".png"));
  }
  return out;
}

/** Local + aliased + extension variants for an existing CMS media path. */
export function varsoviaMediaPathCandidates(path: string): string[] {
  const key = normalizeKey(path);
  const aliased = aliasVarsoviaMediaPath(key);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of [key, aliased, ...withSwappedExt(key), ...withSwappedExt(aliased)]) {
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
