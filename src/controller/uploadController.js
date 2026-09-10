const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const asyncHandler = require("../utils/asyncHandler");
const {
  UPLOAD_ROOT,
  publicUrlFor,
  hasCloudinary,
} = require("../config/upload");

function cloudinaryClient() {
  const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

function coverUrlFromCloudinary(publicId) {
  const cloudinary = cloudinaryClient();
  return cloudinary.url(publicId, {
    resource_type: "image",
    page: 1,
    format: "jpg",
    width: 900,
    crop: "limit",
    quality: "auto",
    secure: true,
  });
}

function renderLocalPdfCover(pdfPath) {
  const out = pdfPath.replace(/\.pdf$/i, "-cover.jpg");
  const argsSets = [
    ["convert", ["-density", "120", `${pdfPath}[0]`, "-quality", "85", out]],
    ["magick", ["convert", "-density", "120", `${pdfPath}[0]`, "-quality", "85", out]],
    ["gs", ["-dSAFER", "-dBATCH", "-dNOPAUSE", "-sDEVICE=jpeg", "-dFirstPage=1", "-dLastPage=1", "-r120", `-sOutputFile=${out}`, pdfPath]],
    ["pdftoppm", ["-jpeg", "-f", "1", "-singlefile", "-r", "120", pdfPath, out.replace(/\.jpg$/i, "")]],
  ];
  for (const [bin, args] of argsSets) {
    try {
      const result = spawnSync(bin, args, { timeout: 30000, windowsHide: true });
      const jpg =
        fs.existsSync(out) ? out : `${out.replace(/\.jpg$/i, "")}.jpg`;
      if (result.status === 0 && fs.existsSync(jpg)) return jpg;
    } catch {
      /* try next renderer */
    }
  }
  return "";
}

async function uploadToCloudinary(filePath, kind) {
  const cloudinary = cloudinaryClient();
  const isPdf = kind === "pdf" || /\.pdf$/i.test(filePath);
  const resourceType = isPdf ? "image" : kind === "video" ? "video" : "image";
  const folder = `thailand-kitchens/${kind || "images"}`;
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
    ...(isPdf ? { format: "pdf" } : {}),
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    coverUrl: isPdf ? coverUrlFromCloudinary(result.public_id) : "",
  };
}

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const kind = String(req.body?.kind || req.query?.kind || "image").toLowerCase();
  let url = publicUrlFor(req, req.file.path);
  let publicId = "";
  let storage = "local";
  let coverUrl = "";

  if (hasCloudinary()) {
    try {
      const cloud = await uploadToCloudinary(req.file.path, kind);
      url = cloud.url;
      publicId = cloud.publicId;
      storage = "cloudinary";
      coverUrl = cloud.coverUrl || "";
      fs.unlink(req.file.path, () => {});
    } catch (err) {
      console.error("Cloudinary upload failed, keeping local file:", err.message);
    }
  }

  if (!coverUrl && (kind === "pdf" || /\.pdf$/i.test(req.file.originalname || ""))) {
    const localCover = renderLocalPdfCover(req.file.path);
    if (localCover) coverUrl = publicUrlFor(req, localCover);
  }

  return res.status(201).json({
    success: true,
    file: {
      url,
      coverUrl,
      publicId,
      storage,
      kind,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      relativePath: path.relative(UPLOAD_ROOT, req.file.path).split(path.sep).join("/"),
      coverHint: coverUrl
        ? ""
        : "Page-1 cover was not generated. Install ImageMagick/pdftoppm or configure Cloudinary, or upload page 1 as the Cover Image.",
    },
  });
});

const deleteUpload = asyncHandler(async (req, res) => {
  const { publicId, relativePath, storage } = req.body || {};

  if (storage === "cloudinary" && publicId && hasCloudinary()) {
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
    return res.json({ success: true, message: "Deleted from Cloudinary" });
  }

  if (relativePath) {
    const safe = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
    const full = path.join(UPLOAD_ROOT, safe);
    if (full.startsWith(UPLOAD_ROOT) && fs.existsSync(full)) {
      fs.unlinkSync(full);
    }
    return res.json({ success: true, message: "Deleted local file" });
  }

  return res.status(400).json({ success: false, message: "Nothing to delete" });
});

module.exports = { uploadFile, deleteUpload };
