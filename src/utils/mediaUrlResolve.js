/**
 * Classify and resolve external media URLs for admin previews.
 */

function normalizeUrl(url) {
  return String(url || "").trim().replace(/^['"]+|['"]+$/g, "").trim();
}

function extractPexelsId(url) {
  const value = normalizeUrl(url);
  const match = value.match(/pexels\.com\/(?:video|photo)\/[^/]*?(\d{5,})\/?/i);
  return match?.[1] || null;
}

function pexelsVideoThumbnailUrl(url) {
  const id = extractPexelsId(url);
  if (!id) return "";
  return `https://images.pexels.com/videos/${id}/pexels-photo-${id}.jpeg`;
}

function classifyMediaUrl(url) {
  const value = normalizeUrl(url);
  if (!value) return "empty";

  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(value)) return "embed-video";

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
        return "This is an image field. You pasted a Pexels video page link. Upload an image, or paste a direct image URL (.jpg / .png), or use /products/…";
      case "pexels-photo-page":
      case "unsplash-photo-page":
        return "Gallery page link — use Upload or a direct image URL (.jpg / .png).";
      case "direct-video":
      case "embed-video":
        return "This is an image field — video links are not supported here. Upload an image or paste an image URL.";
      default:
        return "";
    }
  }

  switch (kind) {
    case "pexels-video-page":
      return "Pexels page links cannot play as hero video. Upload the file or paste a direct .mp4 URL.";
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

async function resolveMediaUrl(url, field = "image") {
  const normalized = normalizeUrl(url);
  const kind = classifyMediaUrl(normalized);
  const hint = hintForKind(kind, field);

  const base = {
    url: normalized,
    kind,
    hint,
    previewUrl: normalized,
    playable: false,
  };

  if (kind === "direct-image" || kind === "direct-video") {
    return {
      ...base,
      playable: kind === "direct-video",
    };
  }

  if (kind === "embed-video") {
    return { ...base, playable: true };
  }

  if (kind === "pexels-video-page") {
    const thumb = pexelsVideoThumbnailUrl(normalized);
    return {
      ...base,
      previewUrl: thumb,
      playable: false,
      provider: "pexels",
    };
  }

  if (kind === "pexels-photo-page") {
    const id = extractPexelsId(normalized);
    const thumb = id
      ? `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`
      : "";
    return {
      ...base,
      previewUrl: thumb,
      playable: false,
      provider: "pexels",
    };
  }

  return base;
}

module.exports = {
  normalizeUrl,
  classifyMediaUrl,
  hintForKind,
  resolveMediaUrl,
  extractPexelsId,
  pexelsVideoThumbnailUrl,
};
