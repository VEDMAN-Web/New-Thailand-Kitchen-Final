const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../config/upload");
const { uploadFile, deleteUpload } = require("../controller/uploadController");

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
        message: "File too large. Max size is 50MB.",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || "Upload failed",
    });
  });
}

// JWT-protected media uploads for admin CMS
router.post("/", protect, uploadSingle, uploadFile);
router.delete("/", protect, deleteUpload);

module.exports = router;
