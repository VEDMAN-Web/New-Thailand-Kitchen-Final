const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../config/upload");
const { uploadFile, deleteUpload } = require("../controller/uploadController");
const { resolveMedia } = require("../controller/mediaResolveController");
const uploadLimits = require("../config/uploadLimits");
const {
  uploadTimeout,
  uploadRateLimit,
  uploadConcurrencyControl,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

function uploadSingle(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();

    // Client closed the connection (navigated away, cancelled, or remounted).
    if (
      err.message === "Request aborted" ||
      err.code === "ECONNABORTED" ||
      req.aborted ||
      req.socket?.destroyed
    ) {
      return;
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        code: "FILE_TOO_LARGE",
        message: `File too large. Maximum size is ${uploadLimits.MAX_FILE_SIZE_MB}MB.`,
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        code: "INVALID_FILE_COUNT",
        message: "Only one file is allowed per upload",
      });
    }

    if (err.code === "LIMIT_PART_COUNT") {
      return res.status(400).json({
        success: false,
        code: "INVALID_PARTS",
        message: "Multipart request has too many parts",
      });
    }

    if (err.code === "LIMIT_FIELD_KEY") {
      return res.status(400).json({
        success: false,
        code: "INVALID_FIELD_NAME",
        message: "Field name is too long",
      });
    }

    if (err.code === "LIMIT_FIELD_VALUE") {
      return res.status(400).json({
        success: false,
        code: "INVALID_FIELD_VALUE",
        message: "Field value is too large",
      });
    }

    return res.status(400).json({
      success: false,
      code: "UPLOAD_FAILED",
      message: err.message || "Upload failed",
    });
  });
}

// Public GET: resolve Pexels/Unsplash page links to CDN files (allowlisted hosts only).
router.get("/resolve", resolveMedia);

router.post(
  "/",
  protect,
  uploadTimeout,
  uploadRateLimit,
  uploadConcurrencyControl,
  uploadSingle,
  uploadFile
);

router.delete("/", protect, deleteUpload);

module.exports = router;
