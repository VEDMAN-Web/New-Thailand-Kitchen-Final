const uploadLimits = require("../config/uploadLimits");
const { checkRateLimit, getIdentifier } = require("../utils/rateLimiter");
const {
  acquireUploadSlot,
  releaseUploadSlot,
} = require("../utils/concurrencyLimiter");

function uploadTimeout(req, res, next) {
  const timeoutMs = uploadLimits.TIMEOUT_MS;

  const timeoutHandle = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        code: "UPLOAD_TIMEOUT",
        message: `Upload timeout after ${timeoutMs / 1000} seconds`,
      });
    }
    req.socket?.destroy();
  }, timeoutMs);

  const cleanup = () => {
    clearTimeout(timeoutHandle);
  };

  req.on("end", cleanup);
  res.on("finish", cleanup);
  res.on("close", cleanup);

  next();
}

function uploadRateLimit(req, res, next) {
  const identifier = getIdentifier(req);
  const check = checkRateLimit(
    "upload",
    identifier,
    uploadLimits.RATE_LIMIT_MAX_REQUESTS,
    uploadLimits.RATE_LIMIT_WINDOW_SECONDS
  );

  res.set("X-RateLimit-Limit", uploadLimits.RATE_LIMIT_MAX_REQUESTS);
  res.set("X-RateLimit-Remaining", check.remaining);
  res.set("X-RateLimit-Reset", Math.ceil(check.resetAt / 1000));

  if (!check.allowed) {
    return res.status(429).json({
      success: false,
      code: "UPLOAD_RATE_LIMIT_EXCEEDED",
      message: "Too many upload requests. Please try again later.",
      retryAfter: Math.ceil((check.resetAt - Date.now()) / 1000),
    });
  }

  next();
}

function uploadConcurrencyControl(req, res, next) {
  const slot = acquireUploadSlot(uploadLimits.MAX_CONCURRENT);

  if (!slot.acquired) {
    return res.status(429).json({
      success: false,
      code: "UPLOAD_CAPACITY_EXCEEDED",
      message:
        "Upload capacity is temporarily busy. Please try again shortly.",
    });
  }

  const cleanup = () => {
    releaseUploadSlot();
  };

  req.on("end", cleanup);
  req.on("close", cleanup);
  res.on("finish", cleanup);
  res.on("close", cleanup);

  next();
}

function aiImageRateLimit(req, res, next) {
  const identifier = getIdentifier(req);
  const check = checkRateLimit(
    "ai-image",
    identifier,
    uploadLimits.AI_IMAGE_RATE_LIMIT,
    uploadLimits.AI_IMAGE_RATE_WINDOW_SECONDS
  );

  res.set("X-RateLimit-Limit", uploadLimits.AI_IMAGE_RATE_LIMIT);
  res.set("X-RateLimit-Remaining", check.remaining);
  res.set("X-RateLimit-Reset", Math.ceil(check.resetAt / 1000));

  if (!check.allowed) {
    return res.status(429).json({
      success: false,
      code: "AI_IMAGE_RATE_LIMIT_EXCEEDED",
      message: "Too many image generation requests. Please try again later.",
      retryAfter: Math.ceil((check.resetAt - Date.now()) / 1000),
    });
  }

  next();
}

module.exports = {
  uploadTimeout,
  uploadRateLimit,
  uploadConcurrencyControl,
  aiImageRateLimit,
};
