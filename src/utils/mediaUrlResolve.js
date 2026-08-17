/**
 * Classify and resolve external media URLs for admin previews and the live site.
 * Pexels download/page links are followed to the CDN file so <video>/<img> can play.
 */

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
};

const ALLOWED_HOST_RE =
  /(?:^|\.)((?:www\.)?pexels\.com|videos\.pexels\.com|images\.pexels\.com|(?:images\.|plus\.)?unsplash\.com|(?:www\.)?pixabay\.com|cdn\.pixabay\.com|(?:www\.)?youtube\.com|youtu\.be|(?:player\.)?vimeo\.com|(?:www\.)?dropbox\.com|dl\.dropboxusercontent\.com)$/i;

const cache = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_MAX = 400;

function normalizeUrl(url) {
  return String(url || "")
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .trim();
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isPrivateHostname(hostname) {
  const host = String(hostname || "").toLowerCase();
  if (!host) return true;
  if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1") {
    return true;
  }
  if (/^10\.\d+\.\d+\.\d+$/.test(host)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(host)) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  return false;
}

function isAllowedResolveHost(url) {
  const host = hostnameOf(url);
  if (!host || isPrivateHostname(host)) return false;
  return ALLOWED_HOST_RE.test(host);
}

function extractPexelsId(url) {
  const value = normalizeUrl(url);
  if (!/pexels\.com/i.test(value)) return null;
  const match = value.match(/(?:\/|-)(\d{5,})(?:\/|$|\?|#)/);
  return match?.[1] || null;
}

function extractUnsplashPhotoId(url) {
  const value = normalizeUrl(url);
  const match = value.match(/unsplash\.com\/photos\/(?:[^/?#]*-)?([A-Za-z0-9_-]{11,})/i);
  return match?.[1] || null;
}

function pexelsVideoThumbnailUrl(url) {
  const id = extractPexelsId(url);
  if (!id) return "";
  return `https://images.pexels.com/videos/${id}/pexels-photo-${id}.jpeg`;
}

function pexelsPhotoUrl(url) {
  const id = extractPexelsId(url);
  if (!id) return "";
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`;
}

function pexelsVideoDownloadUrl(id) {
  return `https://www.pexels.com/download/video/${id}/`;
}

function classifyMediaUrl(url) {
  const value = normalizeUrl(url);
  if (!value) return "empty";

  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(value)) return "embed-video";

  if (/dropbox\.com/i.test(value)) {
    if (/\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(value) || /[?&]raw=1|[?&]dl=1/i.test(value)) {
      return /\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(value)
        ? "direct-image"
        : "direct-video";
    }
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
    /videos\.pexels\.com|cdn\.pixabay\.com\/video/i.test(value)
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

  if (value.startsWith("/uploads/") || value.startsWith("/products/")) {
    return "direct-image";
  }

  if (/^https?:\/\//i.test(value)) return "unknown";

  if (value.startsWith("/")) return "direct-image";

  return "unknown";
}

function hintForKind(kind, field = "image") {
  const isVideo = field === "video";
  if (!isVideo) {
    switch (kind) {
      case "pexels-video-page":
        return "This is an image field. A still from that Pexels video will be used. Upload an image if you need a photo instead.";
      case "pexels-photo-page":
      case "unsplash-photo-page":
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
      return "";
    case "pexels-photo-page":
    case "unsplash-photo-page":
      return "Photo page link — for hero video use Upload or a direct .mp4 / YouTube / Vimeo URL.";
    case "embed-video":
      return "YouTube/Vimeo links work for hero video fields.";
    case "direct-video":
      return "";
    default:
      return "";
  }
}

function rewriteDropbox(url) {
  try {
    const parsed = new URL(url);
    if (!/dropbox\.com/i.test(parsed.hostname)) return url;
    parsed.searchParams.delete("dl");
    parsed.searchParams.set("raw", "1");
    return parsed.href;
  } catch {
    return url;
  }
}

function looksLikeVideoFile(url, contentType = "") {
  return (
    /video\//i.test(contentType) ||
    /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(url) ||
    /videos\.pexels\.com/i.test(url)
  );
}

function looksLikeImageFile(url, contentType = "") {
  return (
    /image\//i.test(contentType) ||
    /\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(url) ||
    /images\.pexels\.com|images\.unsplash\.com/i.test(url)
  );
}

async function followRedirects(startUrl, { wantVideo }) {
  let current = startUrl;
  for (let hop = 0; hop < 6; hop += 1) {
    if (!isAllowedResolveHost(current) || isPrivateHostname(hostnameOf(current))) {
      return null;
    }

    const res = await fetch(current, {
      method: "GET",
      redirect: "manual",
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(8000),
    });

    const location = res.headers.get("location");
    if (location && res.status >= 300 && res.status < 400) {
      const next = new URL(location, current).href;
      if (isPrivateHostname(hostnameOf(next))) return null;
      if (wantVideo && looksLikeVideoFile(next)) return next;
      if (!wantVideo && looksLikeImageFile(next)) return next;
      current = next;
      continue;
    }

    const contentType = res.headers.get("content-type") || "";
    if (wantVideo && looksLikeVideoFile(current, contentType)) return current;
    if (!wantVideo && looksLikeImageFile(current, contentType)) return current;
    return null;
  }
  return null;
}

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function cacheSet(key, value) {
  if (cache.size >= CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, { at: Date.now(), value });
}

async function resolvePexelsVideo(url) {
  const id = extractPexelsId(url);
  const thumb = pexelsVideoThumbnailUrl(url);
  if (!id) return { fileUrl: "", thumb };
  const fileUrl = await followRedirects(pexelsVideoDownloadUrl(id), {
    wantVideo: true,
  });
  return { fileUrl: fileUrl || "", thumb };
}

async function resolveMediaUrl(url, field = "image") {
  const normalized = normalizeUrl(url);
  const kind = classifyMediaUrl(normalized);
  const hint = hintForKind(kind, field);
  const cacheKey = `${field}::${normalized}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const base = {
    url: normalized,
    kind,
    hint,
    previewUrl: normalized,
    resolvedUrl: normalized,
    playable: false,
  };

  let result = base;

  if (kind === "direct-image") {
    result = { ...base, playable: false };
  } else if (kind === "direct-video") {
    result = { ...base, playable: true };
  } else if (kind === "embed-video") {
    result = { ...base, playable: true };
  } else if (kind === "dropbox-link") {
    const rewritten = rewriteDropbox(normalized);
    result = {
      ...base,
      previewUrl: rewritten,
      resolvedUrl: rewritten,
      playable: field === "video" || /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(rewritten),
      provider: "dropbox",
    };
  } else if (kind === "pexels-video-page") {
    try {
      const { fileUrl, thumb } = await resolvePexelsVideo(normalized);
      if (field === "video" && fileUrl) {
        result = {
          ...base,
          hint: "",
          previewUrl: fileUrl,
          resolvedUrl: fileUrl,
          playable: true,
          provider: "pexels",
        };
      } else {
        result = {
          ...base,
          previewUrl: thumb || fileUrl || normalized,
          resolvedUrl: field === "image" ? thumb || normalized : fileUrl || normalized,
          playable: Boolean(fileUrl) && field === "video",
          provider: "pexels",
        };
      }
    } catch {
      const thumb = pexelsVideoThumbnailUrl(normalized);
      result = {
        ...base,
        previewUrl: thumb || normalized,
        resolvedUrl: thumb || normalized,
        playable: false,
        provider: "pexels",
      };
    }
  } else if (kind === "pexels-photo-page") {
    const photo = pexelsPhotoUrl(normalized);
    result = {
      ...base,
      hint: "",
      previewUrl: photo || normalized,
      resolvedUrl: photo || normalized,
      playable: false,
      provider: "pexels",
    };
  } else if (kind === "unsplash-photo-page") {
    result = { ...base, provider: "unsplash" };
  }

  cacheSet(cacheKey, result);
  return result;
}

module.exports = {
  normalizeUrl,
  classifyMediaUrl,
  hintForKind,
  resolveMediaUrl,
  extractPexelsId,
  extractUnsplashPhotoId,
  pexelsVideoThumbnailUrl,
  isAllowedResolveHost,
};
