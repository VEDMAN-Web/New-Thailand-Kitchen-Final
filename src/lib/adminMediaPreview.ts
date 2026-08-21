/**
 * Resolve CMS media paths for admin previews.
 */

import {
  aliasVarsoviaMediaPath,
  isVarsoviaPublicAssetPath,
  mapThailandKitchenPathToVarsovia,
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
  // Varsovia-specific paths that must be recognized
  "/home/",
  "/team/",
  "/quality-sale/",
  "/Interior-kitchen/",
  "/showcase/",
  "/partners/",
  "/vision/",
];

function thailandFrontendOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_THAILAND_FRONTEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_FRONTEND_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

function publicFrontendOrigin(): string {
  return thailandFrontendOrigin();
}

function kitchenPathsNeedVarsoviaFallback(): boolean {
  return thailandFrontendOrigin() === varsoviaFrontendOrigin();
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

function isPrivatePreviewHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
}

function toPreviewPathname(url: string): string {
  const value = normalizeMediaPath(url);
  if (!value) return "";
  if (/^(data:|blob:)/i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.pathname.startsWith("/uploads/")) return parsed.pathname;
      if (isPrivatePreviewHost(parsed.hostname)) return parsed.pathname || value;
    } catch {
      return value;
    }
  }
  return value;
}

function previewPath(url: string): string {
  const pathname = toPreviewPathname(url);
  if (/^(data:|blob:)/i.test(pathname) || /^https?:\/\//i.test(pathname)) {
    return pathname;
  }
  const aliased = aliasVarsoviaMediaPath(aliasLegacyMediaPath(pathname));
  if (kitchenPathsNeedVarsoviaFallback()) {
    return mapThailandKitchenPathToVarsovia(aliased);
  }
  return aliased;
}

export function resolveAdminMediaPreviewUrl(url: string): string {
  const trimmed = previewPath(url);
  if (!trimmed) return "";

  if (/^(data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const localHost = isPrivatePreviewHost(parsed.hostname);
      const pathname = encodeMediaPath(
        kitchenPathsNeedVarsoviaFallback()
          ? mapThailandKitchenPathToVarsovia(aliasVarsoviaMediaPath(parsed.pathname))
          : aliasVarsoviaMediaPath(parsed.pathname)
      );
      if (localHost && pathname.startsWith("/uploads/")) {
        return `${pathname}${parsed.search}`;
      }
      if (isVarsoviaPublicAssetPath(pathname)) {
        const resolved = `${varsoviaFrontendOrigin()}${pathname}${parsed.search}`;
        console.log(`[Preview] Varsovia asset: ${trimmed} -> ${resolved}`);
        return resolved;
      }
      if (localHost && isPublicSiteAssetPath(pathname)) {
        return `${publicFrontendOrigin()}${pathname}${parsed.search}`;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  const path = encodeMediaPath(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
  
  // Priority order: uploads -> Varsovia assets -> Thailand assets
  if (path.startsWith("/uploads/")) return path;
  
  // Check if this is a Varsovia asset path (most showcase/project images)
  if (isVarsoviaPublicAssetPath(path)) {
    const resolved = `${varsoviaFrontendOrigin()}${path}`;
    console.log(`[Preview] Varsovia asset: ${trimmed} -> ${resolved}`);
    return resolved;
  }
  
  // Check if this is a Thailand asset path
  if (isPublicSiteAssetPath(path)) {
    return `${publicFrontendOrigin()}${path}`;
  }
  
  // Default: treat as relative path
  console.log(`[Preview] Unknown path type: ${trimmed} -> ${path}`);
  return path;
}

/** Same-origin rewrite fallback if the frontend origin is unreachable. */
export function resolveAdminMediaPreviewFallbacks(url: string): string[] {
  const path = previewPath(url);
  const primary = resolveAdminMediaPreviewUrl(url);
  if (!path) return [];
  if (/^(data:|blob:)/i.test(path)) return [path];

  const seen = new Set<string>();
  const out: string[] = [];
  const push = (candidate: string) => {
    if (candidate && !seen.has(candidate)) {
      seen.add(candidate);
      out.push(candidate);
    }
  };

  push(primary);
  if (/^https?:\/\//i.test(path)) {
    push(path);
    return out.slice(0, 4);
  }

  const encoded = encodeMediaPath(path.startsWith("/") ? path : `/${path}`);
  
  // Priority 1: Varsovia assets (where most showcase/project images live)
  if (isVarsoviaPublicAssetPath(encoded)) {
    push(`${varsoviaFrontendOrigin()}${encoded}`);
    push(withVarsoviaStatic(encoded));
    push(varsoviaRemotePreviewUrl(encoded));
  } 
  // Priority 2: Uploads
  else if (encoded.startsWith("/uploads/")) {
    push(encoded);
  } 
  // Priority 3: Thailand assets
  else if (isPublicSiteAssetPath(encoded)) {
    push(`${publicFrontendOrigin()}${encoded}`);
    push(encoded);
  } 
  // Priority 4: Try both origins
  else {
    push(`${varsoviaFrontendOrigin()}${encoded}`);
    push(`${publicFrontendOrigin()}${encoded}`);
    push(encoded);
    push(withVarsoviaStatic(encoded));
  }
  
  // Add remote fallback as last resort
  const remote = varsoviaRemotePreviewUrl(encoded);
  if (remote) push(remote);
  
  return out.filter((item) => !/\/products\/Kitchen/i.test(item)).slice(0, 5);
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
