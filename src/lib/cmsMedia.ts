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
    /videos\.pexels\.com/i.test(value) ||
    value.includes("/uploads/videos/")
  );
}

export function isDirectImageUrl(url: string): boolean {
  const value = resolveCmsMediaUrl(url);
  if (!value) return false;
  if (isDirectVideoUrl(value) || isEmbedVideoUrl(value)) return false;
  return (
    /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i.test(value) ||
    /images\.pexels\.com|images\.unsplash\.com/i.test(value) ||
    value.includes("/uploads/images/") ||
    value.includes("/uploads/icons/") ||
    /^\/(products|product|features|blog|catlog|slider|testimonial|contactUs|brandLogo|footer|icon)\//i.test(
      value
    )
  );
}

export function needsRemoteMediaResolve(url: string): boolean {
  const value = String(url || "").trim();
  if (!/^https?:\/\//i.test(value)) return false;
  if (
    /videos\.pexels\.com|images\.pexels\.com|images\.unsplash\.com/i.test(value)
  ) {
    return false;
  }
  if (
    /\.(mp4|webm|ogg|ogv|mov|png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(value)
  ) {
    return false;
  }
  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(value)) return false;
  return /pexels\.com|unsplash\.com\/photos|dropbox\.com/i.test(value);
}

function mediaApiBase() {
  if (typeof window !== "undefined") return "/cms-api";
  const backend = (
    process.env.BACKEND_URL?.trim() || "http://127.0.0.1:5000"
  ).replace(/\/+$/, "");
  return /\/api$/i.test(backend) ? backend : `${backend}/api`;
}

const remoteResolveCache = new Map<string, Promise<string>>();

export async function resolveRemoteCmsMedia(
  url: string,
  field: "image" | "video" = "image"
): Promise<string> {
  const local = resolveCmsMediaUrl(url);
  if (!local || !needsRemoteMediaResolve(local)) return local;

  const key = `${field}::${local}`;
  const cached = remoteResolveCache.get(key);
  if (cached) return cached;

  const pending = (async () => {
    try {
      const endpoint = `${mediaApiBase()}/upload/resolve?url=${encodeURIComponent(local)}&field=${field}`;
      const res = await fetch(
        endpoint,
        typeof window === "undefined"
          ? { next: { revalidate: 3600 } }
          : { cache: "no-store" }
      );
      if (!res.ok) return local;
      const data = (await res.json()) as {
        resolvedUrl?: string;
        previewUrl?: string;
      };
      const next = String(data.resolvedUrl || data.previewUrl || "").trim();
      return next ? resolveCmsMediaUrl(next, local) : local;
    } catch {
      return local;
    }
  })();

  remoteResolveCache.set(key, pending);
  return pending;
}

function fieldForMediaKey(key: string): "image" | "video" {
  if (/video/i.test(key) && !/poster|thumbnail|cover/i.test(key)) return "video";
  return "image";
}

/** Walk CMS JSON and replace Pexels/Unsplash page links with CDN files. */
export async function hydrateCmsMediaTree<T>(value: T): Promise<T> {
  const pending = new Map<string, "image" | "video">();

  const collect = (node: unknown, key: string) => {
    if (typeof node === "string") {
      if (needsRemoteMediaResolve(node)) {
        const prev = pending.get(node);
        if (prev !== "video") pending.set(node, fieldForMediaKey(key));
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item) => collect(item, key));
      return;
    }
    if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        collect(v, k);
      }
    }
  };

  collect(value, "");
  if (!pending.size) return value;

  const resolved = new Map<string, string>();
  await Promise.all(
    [...pending.entries()].map(async ([url, field]) => {
      resolved.set(url, await resolveRemoteCmsMedia(url, field));
    })
  );

  const replace = (node: unknown): unknown => {
    if (typeof node === "string") return resolved.get(node) || node;
    if (Array.isArray(node)) return node.map(replace);
    if (node && typeof node === "object") {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        result[k] = replace(v);
      }
      return result;
    }
    return node;
  };

  return replace(value) as T;
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
