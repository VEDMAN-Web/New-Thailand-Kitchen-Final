/**
 * Resolve CMS media paths for admin previews.
 */

const PUBLIC_ASSET_PREFIXES = [
  "/products/",
  "/product/",
  "/features/",
  "/brandLogo/",
  "/blog/",
  "/catlog/",
  "/slider/",
  "/testimonial/",
  "/footer/",
  "/icon/",
  "/video/",
  "/logo1.svg",
  "/contactUs/",
  "/images/",
  "/assets/",
];

export type MediaUrlKind =
  | "empty"
  | "direct-image"
  | "direct-video"
  | "embed-video"
  | "pexels-video-page"
  | "pexels-photo-page"
  | "unsplash-photo-page"
  | "page-link"
  | "unknown";

export function normalizeMediaPath(url: string): string {
  let value = String(url || "").trim();
  if (!value) return "";
  value = value.replace(/^['"]+|['"]+$/g, "").trim();
  value = value.replace(/\\/g, "/");
  return value;
}

/** Extract numeric id from pexels.com/video/...-123/ or photo pages. */
export function extractPexelsId(url: string): string | null {
  const value = normalizeMediaPath(url);
  const match = value.match(/pexels\.com\/(?:video|photo)\/[^/]*?(\d{5,})\/?/i);
  return match?.[1] || null;
}

/** Known public thumbnail for a Pexels video page (still image). */
export function pexelsVideoThumbnailUrl(url: string): string {
  const id = extractPexelsId(url);
  if (!id) return "";
  return `https://images.pexels.com/videos/${id}/pexels-photo-${id}.jpeg`;
}

export function classifyMediaUrl(url: string): MediaUrlKind {
  const value = normalizeMediaPath(url);
  if (!value) return "empty";

  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(value)) return "embed-video";

  // www.pexels.com / v.pexels.com video pages (not CDN file hosts)
  if (
    /(?:^|\/\/)(?:www\.|v\.)?pexels\.com\/video\//i.test(value) &&
    !/videos\.pexels\.com|images\.pexels\.com/i.test(value)
  ) {
    return "pexels-video-page";
  }
  if (
    /(?:^|\/\/)(?:www\.)?pexels\.com\/photo\//i.test(value) &&
    !/images\.pexels\.com/i.test(value)
  ) {
    return "pexels-photo-page";
  }
  if (
    /unsplash\.com\/photos\//i.test(value) &&
    !/images\.unsplash\.com/i.test(value)
  ) {
    return "unsplash-photo-page";
  }

  if (
    /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(value) ||
    /videos\.pexels\.com/i.test(value)
  ) {
    return "direct-video";
  }

  if (
    /\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(value) ||
    /images\.pexels\.com|images\.unsplash\.com/i.test(value) ||
    /^data:image\//i.test(value)
  ) {
    return "direct-image";
  }

  if (value.startsWith("/")) return "direct-image";
  if (/^https?:\/\//i.test(value)) return "unknown";

  return "unknown";
}

/**
 * Hints for admin fields.
 * forVideoField=false → image/icon fields (never mention .mp4 / video upload).
 */
export function mediaUrlHint(kind: MediaUrlKind, forVideoField = false): string {
  if (!forVideoField) {
    switch (kind) {
      case "pexels-video-page":
        return "This is an image field. You pasted a Pexels video page link. Upload an image, or paste a direct image URL (e.g. .jpg / .png), or use /products/…";
      case "pexels-photo-page":
      case "unsplash-photo-page":
        return "Gallery page link — use Upload or a direct image URL (.jpg / .png) for a reliable image.";
      case "direct-video":
      case "embed-video":
        return "This is an image field — video links are not supported here. Upload an image or paste an image URL.";
      default:
        return "";
    }
  }

  switch (kind) {
    case "pexels-video-page":
      return "Pexels page link — thumbnail only. For the live hero, Upload a video file or paste a direct .mp4 URL.";
    case "pexels-photo-page":
    case "unsplash-photo-page":
      return "This looks like a photo page, not a video. Use Upload or a direct .mp4 / YouTube / Vimeo link.";
    case "direct-video":
      return "";
    case "embed-video":
      return "YouTube/Vimeo link — works on hero video fields.";
    default:
      return "";
  }
}

export function isPublicSiteAssetPath(path: string): boolean {
  const p = path.startsWith("/") ? path : `/${path}`;
  return PUBLIC_ASSET_PREFIXES.some(
    (prefix) => p === prefix.slice(0, -1) || p.startsWith(prefix)
  );
}

export function isEmbedVideoUrl(url: string): boolean {
  return classifyMediaUrl(url) === "embed-video";
}

export function toEmbedVideoSrc(url: string): string {
  const trimmed = normalizeMediaPath(url);
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

export function aliasLegacyMediaPath(path: string): string {
  const match = path.match(/\/brandLogo\/partner-(\d)\.svg$/i);
  if (match) return `/brandLogo/first (${match[1]}).png`;
  return path;
}

export function encodeMediaPath(path: string): string {
  const raw = path.startsWith("/") ? path : `/${path}`;
  return raw
    .split("/")
    .map((segment, index) => (index === 0 ? segment : encodeURIComponent(segment)))
    .join("/");
}

export function resolveAdminMediaPreviewUrl(url: string): string {
  const trimmed = aliasLegacyMediaPath(normalizeMediaPath(url));
  if (!trimmed) return "";

  if (/^(data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const pathname = encodeMediaPath(parsed.pathname);
      if (pathname.startsWith("/uploads/") || isPublicSiteAssetPath(pathname)) {
        return `${pathname}${parsed.search}`;
      }
      return `${parsed.origin}${pathname}${parsed.search}`;
    } catch {
      return trimmed;
    }
  }

  const path = encodeMediaPath(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
  return path;
}

export function needsRemoteResolve(kind: MediaUrlKind): boolean {
  return (
    kind === "pexels-video-page" ||
    kind === "pexels-photo-page" ||
    kind === "unsplash-photo-page"
  );
}
