const asyncHandler = require("../utils/asyncHandler");
const { resolveMediaUrl } = require("../utils/mediaUrlResolve");

const resolveMedia = asyncHandler(async (req, res) => {
  const url = String(req.query.url || "").trim();
  if (!url) {
    return res.status(400).json({ success: false, message: "url query required" });
  }

  const field = String(req.query.field || "image").trim().toLowerCase();
  const resolved = await resolveMediaUrl(url, field === "video" ? "video" : "image");
  return res.json({ success: true, ...resolved });
});

module.exports = { resolveMedia };
