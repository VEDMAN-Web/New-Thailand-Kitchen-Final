/**
 * Resolve CMS media paths for admin previews.
 */

import {
  aliasVarsoviaMediaPath,
  isVarsoviaPublicAssetPath,
  varsoviaMediaPathCandidates,
  varsoviaRemotePreviewUrl,
  VARSOVIA_STATIC_PREFIX,
} from "./varsoviaMediaAliases";

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
  "/logo1.png",
  "/contactUs/",
  "/images/",
  "/assets/",
  "/gallery/",
];

function publicFrontendOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_FRONTEND_URL?.trim() || "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export type MediaUrlKind =
  | "empty"
  | "direct-image"
  | "direct-video"
  | "embed-video"
  | "pexels-video-page"
  | "pexels-photo-page"
  | "unsplash-photo-page"
  | "dropbox-link"
  | "page-link"
  | "unknown";

export function normalizeMediaPath(url: string): string {
  let value = String(url || "").trim();
  if (!value) return "";
  value = value.replace(/^['"]+|['"]+$/g, "").trim();
  value = value.replace(/\\/g, "/");
  return value;
}

/** Extract numeric id from Pexels video/photo/download URLs. */
export function extractPexelsId(url: string): string | null {
  const value = normalizeMediaPath(url);
  if (!/pexels\.com/i.test(value)) return null;
  const match = value.match(/(?:\/|-)(\d{5,})(?:\/|$|\?|#)/);
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

  if (/dropbox\.com/i.test(value) && !/[?&]raw=1|[?&]dl=1/i.test(value)) {
    return "dropbox-link";
  }

  const pexelsPage =
    /(?:^|\/\/)(?:www\.|v\.)?pexels\.com\//i.test(value) &&
    !/videos\.pexels\.com|images\.pexels\.com/i.test(value);

  if (pexelsPage && /\/(?:download\/)?video(?:\/|$)/i.test(value)) {
    return "pexels-video-page";
  }
  if (pexelsPage && /\/(?:download\/)?photos?(?:\/|$)|\/photo\//i.test(value)) {
    return "pexels-photo-page";
  }
  if (pexelsPage && extractPexelsId(value)) {
    return "pexels-video-page";
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
    /images\.pexels\.com|images\.unsplash\.com|res\.cloudinary\.com|images\.unsplash/i.test(
      value
    ) ||
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
        return "This is an image field. A still from that Pexels video will be shown. Upload an image if you need a photo instead.";
      case "pexels-photo-page":
      case "unsplash-photo-page":
      case "dropbox-link":
        return "";
      case "direct-video":
      case "embed-video":
        return "This is an image field — video links are not supported here. Upload an image or paste an image URL.";
      default:
        return "";
    }
  }

  switch (kind) {
    case "pexels-video-page":
    case "dropbox-link":
      return "";
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

/** Encode spaces in path segments; keep parentheses so Next can serve public files. */
export function encodeMediaPath(path: string): string {
  const raw = path.startsWith("/") ? path : `/${path}`;
  return raw
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

function varsoviaFrontendOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_VARSOVIA_FRONTEND_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

function withVarsoviaStatic(path: string): string {
  const encoded = encodeMediaPath(path.startsWith("/") ? path : `/${path}`);
  return `${VARSOVIA_STATIC_PREFIX}${encoded}`;
}

export function resolveAdminMediaPreviewUrl(url: string): string {
  const trimmed = aliasVarsoviaMediaPath(aliasLegacyMediaPath(normalizeMediaPath(url)));
  if (!trimmed) return "";

  if (/^(data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const localHost = /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname);
      const pathname = encodeMediaPath(parsed.pathname);
      if (localHost && pathname.startsWith("/uploads/")) {
        return `${pathname}${parsed.search}`;
      }
      if (localHost && isVarsoviaPublicAssetPath(pathname)) {
        return `${withVarsoviaStatic(pathname)}${parsed.search}`;
      }
      if (localHost && isPublicSiteAssetPath(pathname)) {
        return `${publicFrontendOrigin()}${pathname}${parsed.search}`;
      }
      // CDN / Cloudinary / production uploads — use the URL as stored
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  const path = encodeMediaPath(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
  if (isVarsoviaPublicAssetPath(path)) {
    return withVarsoviaStatic(path);
  }
  // Prefer same-origin first: admin public/ + Next rewrites to frontend/API.
  // MediaUpload then falls back to the live frontend origin if needed.
  return path;
}

/** Same-origin rewrite fallback if the frontend origin is unreachable. */
export function resolveAdminMediaPreviewFallbacks(url: string): string[] {
  const aliased = aliasVarsoviaMediaPath(aliasLegacyMediaPath(normalizeMediaPath(url)));
  const primary = resolveAdminMediaPreviewUrl(url);
  const trimmed = aliased;
  if (!trimmed) return [];
  if (/^(data:|blob:)/i.test(trimmed)) return [trimmed];

  let path = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      path = parsed.pathname;
      const absolute = trimmed;
      const seenAbs = new Set<string>();
      const outAbs: string[] = [];
      const encodedPath = encodeMediaPath(path.startsWith("/") ? path : `/${path}`);
      for (const candidate of [
        primary,
        absolute,
        encodedPath,
        isVarsoviaPublicAssetPath(encodedPath)
          ? withVarsoviaStatic(encodedPath)
          : "",
        isVarsoviaPublicAssetPath(encodedPath)
          ? `${varsoviaFrontendOrigin()}${encodedPath}`
          : `${publicFrontendOrigin()}${encodedPath}`,
      ]) {
        if (candidate && !seenAbs.has(candidate)) {
          seenAbs.add(candidate);
          outAbs.push(candidate);
        }
      }
      return outAbs;
    } catch {
      path = trimmed;
    }
  }
  path = encodeMediaPath(path.startsWith("/") ? path : `/${path}`);

  const seen = new Set<string>();
  const out: string[] = [];
  const push = (candidate: string) => {
    if (candidate && !seen.has(candidate)) {
      seen.add(candidate);
      out.push(candidate);
    }
  };

  push(primary);
  for (const candidate of varsoviaMediaPathCandidates(path)) {
    const encoded = encodeMediaPath(candidate);
    if (isVarsoviaPublicAssetPath(encoded)) {
      push(withVarsoviaStatic(encoded));
      push(`${varsoviaFrontendOrigin()}${encoded}`);
    } else {
      push(encoded);
      push(`${publicFrontendOrigin()}${encoded}`);
    }
  }
  push(path);
  if (path.startsWith("/uploads/")) {
    push(`${publicFrontendOrigin()}${path}`);
  }
  push(varsoviaRemotePreviewUrl(path));
  return out;
}

export function needsRemoteResolve(kind: MediaUrlKind): boolean {
  return (
    kind === "pexels-video-page" ||
    kind === "pexels-photo-page" ||
    kind === "unsplash-photo-page" ||
    kind === "dropbox-link"
  );
}

export function isPlayableVideoSrc(url: string): boolean {
  const value = normalizeMediaPath(url);
  if (!value) return false;
  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(value)) return true;
  return (
    /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(value) ||
    /videos\.pexels\.com/i.test(value) ||
    value.includes("/uploads/")
  );
}
