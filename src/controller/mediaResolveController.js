const asyncHandler = require("../utils/asyncHandler");
const {
  resolveMediaUrl,
  isAllowedResolveHost,
  classifyMediaUrl,
} = require("../utils/mediaUrlResolve");

const resolveMedia = asyncHandler(async (req, res) => {
  const url = String(req.query.url || "").trim();
  if (!url) {
    return res.status(400).json({ success: false, message: "url query required" });
  }

  const field = String(req.query.field || "image").trim().toLowerCase();
  const kind = classifyMediaUrl(url);

  // Only follow redirects for allowlisted hosts (blocks SSRF).
  if (
    /^https?:\/\//i.test(url) &&
    ["pexels-video-page", "pexels-photo-page", "unsplash-photo-page", "dropbox-link"].includes(
      kind
    ) &&
    !isAllowedResolveHost(url)
  ) {
    return res.status(400).json({
      success: false,
      message: "This host cannot be resolved.",
      url,
      kind,
      previewUrl: url,
      resolvedUrl: url,
      playable: false,
    });
  }

  const resolved = await resolveMediaUrl(url, field === "video" ? "video" : "image");
  return res.json({ success: true, ...resolved });
});

module.exports = { resolveMedia };
