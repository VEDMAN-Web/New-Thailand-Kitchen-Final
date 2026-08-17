/**
 * Same path aliases as Varsovia frontend `lib/mediaAssets.ts`.
 * CMS still stores legacy paths like `/home/featured-project/feature-1.jpg`
 * while files live under `/home/featured/feature-1.jpg`.
 */

const ALIASES: Record<string, string> = {
  "/home/catalog-1.jpg": "/home/catalog/catalog-2.jpg",
  "/home/product/product-3.jpg": "/home/product/product-3.jpg",
  "/home/home-front-page.png": "/home/hero.jpg",
  "/home/counting.png": "/home/stats.jpg",
  "/home/about-1.png": "/home/about-1.png",
  "/home/about-2.png": "/home/about-2.png",
  "/home/about-3.png": "/home/about-3.png",
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

const VARSOVIA_PUBLIC_PREFIXES = [
  "/home/",
  "/team/",
  "/quality-sale/",
  "/Interior-kitchen/",
  "/blog/blog",
];

/** Same-origin admin prefix rewritten to the Varsovia frontend in next.config. */
export const VARSOVIA_STATIC_PREFIX = "/varsovia-static";

export function aliasVarsoviaMediaPath(path: string): string {
  const key = path.startsWith("/") ? path : `/${path}`;
  return ALIASES[key] || path;
}

export function isVarsoviaPublicAssetPath(path: string): boolean {
  const p = path.startsWith("/") ? path : `/${path}`;
  return VARSOVIA_PUBLIC_PREFIXES.some((prefix) => p.startsWith(prefix));
}
