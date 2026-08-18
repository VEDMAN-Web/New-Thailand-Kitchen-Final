/** Live /projects/[id] always shows 10 photos: Kitchen hero + 4 bento, then Bathroom hero + 4 bento. */

export const SHOWCASE_GALLERY_SLOTS = 10;

export const SHOWCASE_GALLERY_FALLBACK = "/Interior-kitchen/kitchen1.png";

export const SHOWCASE_CATEGORY_OPTIONS = [
  { value: "Home case", label: "Home case" },
  { value: "North America", label: "North America" },
  { value: "South America", label: "South America" },
  { value: "Africa", label: "Africa" },
  { value: "Commercial Project", label: "Commercial Project" },
  { value: "Europe", label: "Europe" },
  { value: "Australia", label: "Australia" },
  { value: "Middle East", label: "Middle East" },
  { value: "Asia", label: "Asia" },
] as const;

export const SHOWCASE_GALLERY_LABELS = [
  "Kitchen image 1 — hero",
  "Kitchen image 2 — bento",
  "Kitchen image 3 — bento",
  "Kitchen image 4 — bento",
  "Kitchen image 5 — bento",
  "Bathroom image 1 — hero",
  "Bathroom image 2 — bento",
  "Bathroom image 3 — bento",
  "Bathroom image 4 — bento",
  "Bathroom image 5 — bento",
] as const;

/**
 * Expand whatever is stored in Mongo into the 10 URLs the live page actually paints.
 * Empty slots reuse the cover / remaining gallery in the same order as the public site.
 */
export function padShowcaseGallery(gallery: unknown, cover: unknown): string[] {
  const raw = Array.isArray(gallery)
    ? gallery.map((url) => String(url ?? "").trim())
    : [];
  const coverUrl = String(cover ?? "").trim();
  const pool = raw.filter(Boolean);
  if (!pool.length && coverUrl) pool.push(coverUrl);
  if (!pool.length) pool.push(SHOWCASE_GALLERY_FALLBACK);
  const out: string[] = [];
  for (let i = 0; i < SHOWCASE_GALLERY_SLOTS; i++) {
    out.push(raw[i] || pool[i % pool.length]);
  }
  return out;
}
