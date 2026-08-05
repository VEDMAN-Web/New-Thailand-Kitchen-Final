const fs = require("fs");
const path = require("path");
const asyncHandler = require("../utils/asyncHandler");
const {
  UPLOAD_ROOT,
  publicUrlFor,
  hasCloudinary,
} = require("../config/upload");

async function uploadToCloudinary(filePath, kind) {
  const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const resourceType =
    kind === "pdf" ? "raw" : kind === "video" ? "video" : "image";
  const folder = `thailand-kitchens/${kind || "images"}`;
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
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

  if (hasCloudinary()) {
    try {
      const cloud = await uploadToCloudinary(req.file.path, kind);
      url = cloud.url;
      publicId = cloud.publicId;
      storage = "cloudinary";
      // remove local temp copy after successful cloud upload
      fs.unlink(req.file.path, () => {});
    } catch (err) {
      console.error("Cloudinary upload failed, keeping local file:", err.message);
    }
  }

  return res.status(201).json({
    success: true,
    file: {
      url,
      publicId,
      storage,
      kind,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      relativePath: path.relative(UPLOAD_ROOT, req.file.path).split(path.sep).join("/"),
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
