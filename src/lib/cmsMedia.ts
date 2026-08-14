/**
 * Resolve CMS media paths for the public site.
 * - localhost / private URLs → same-origin /uploads/… (Next rewrite → API)
 * - External https (Pexels, Cloudinary, Render, etc.) → kept as-is
 * - Site-relative paths → leading slash guaranteed
 */

const DEFAULT_BLOG_COVER = "/products/Kitchen1.png";
const DEFAULT_BLOG_HERO_VIDEO = "/product/productVideo.mp4";

export function extractUploadsPath(url: string): string | null {
  const value = String(url || "").trim();
  if (!value) return null;
  const match = value.match(/\/uploads\/[^\s?#'"]*/i);
  return match ? match[0] : null;
}

export function resolveCmsMediaUrl(url: unknown, fallback = ""): string {
  let value = String(url || "").trim();
  if (!value) value = String(fallback || "").trim();
  if (!value) return "";

  if (/^(data:|blob:)/i.test(value)) return value;

  const partnerPlaceholder = value.match(/\/brandLogo\/partner-(\d)\.svg$/i);
  if (partnerPlaceholder) value = `/brandLogo/first (${partnerPlaceholder[1]}).png`;

  const uploadsPath = extractUploadsPath(value);
  if (uploadsPath) {
    if (/^https?:\/\//i.test(value)) return encodeMediaPath(uploadsPath);
    return encodeMediaPath(uploadsPath);
  }

  if (/^https?:\/\//i.test(value)) return value;
  if (/^(mailto:|tel:)/i.test(value)) return value;
  if (value.includes("@") && !value.includes("/")) return value;
  if (/^\+?[\d\s().-]{6,}$/.test(value)) return value;

  const path = value.startsWith("/") ? value : `/${value}`;
  return encodeMediaPath(path);
}

function encodeMediaPath(path: string): string {
  if (!path.startsWith("/")) return path;
  return path
    .split("/")
    .map((segment, index) => {
      if (index === 0) return segment;
      let decoded = segment;
      try {
        decoded = decodeURIComponent(segment);
      } catch {
        decoded = segment;
      }
      return encodeURI(decoded);
    })
    .join("/");
}

export function isEmbedVideoUrl(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

export function toEmbedVideoSrc(url: string): string {
  const trimmed = String(url || "").trim();
  if (/youtube\.com\/embed\//i.test(trimmed)) return trimmed;
  const yt =
    trimmed.match(/youtu\.be\/([^?&/]+)/i) ||
    trimmed.match(/[?&]v=([^?&]+)/i) ||
    trimmed.match(/youtube\.com\/shorts\/([^?&/]+)/i);
  if (yt?.[1]) {
    const start = trimmed.match(/[?&](?:t|start)=(\d+)/i)?.[1];
    return `https://www.youtube.com/embed/${yt[1]}${start ? `?start=${start}` : ""}`;
  }
  const vimeo = trimmed.match(/vimeo\.com\/(\d+)/i);
  if (vimeo?.[1]) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return trimmed;
}

export function isDirectVideoUrl(url: string): boolean {
  const value = resolveCmsMediaUrl(url);
  if (!value) return false;
  if (isEmbedVideoUrl(value)) return true;
  return (
    /\.(mp4|webm|ogg|ogv|mov)(\?|$)/i.test(value) ||
    value.includes("/uploads/videos/")
  );
}

export function isDirectImageUrl(url: string): boolean {
  const value = resolveCmsMediaUrl(url);
  if (!value) return false;
  if (isDirectVideoUrl(value) || isEmbedVideoUrl(value)) return false;
  return (
    /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i.test(value) ||
    value.includes("/uploads/images/") ||
    value.includes("/uploads/icons/") ||
    /^\/(products|product|features|blog|catlog|slider|testimonial|contactUs|brandLogo|footer|icon)\//i.test(
      value
    )
  );
}

export function cmsImageNeedsUnoptimized(url: string): boolean {
  const value = resolveCmsMediaUrl(url);
  return (
    value.startsWith("http") ||
    value.startsWith("/uploads") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  );
}

export function pickBlogCoverImage(b: {
  image?: string;
  gallery?: string[];
  bodySections?: { image?: string }[];
}): string {
  const fromImage = resolveCmsMediaUrl(b.image);
  if (fromImage) return fromImage;

  for (const g of b.gallery || []) {
    const resolved = resolveCmsMediaUrl(g);
    if (resolved) return resolved;
  }

  for (const section of b.bodySections || []) {
    const resolved = resolveCmsMediaUrl(section?.image);
    if (resolved) return resolved;
  }

  return DEFAULT_BLOG_COVER;
}

export { DEFAULT_BLOG_COVER, DEFAULT_BLOG_HERO_VIDEO };
