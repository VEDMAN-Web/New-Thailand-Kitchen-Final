module.exports = {
  MAX_FILE_SIZE_MB: parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB || "50", 10),
  MAX_CONCURRENT: parseInt(process.env.UPLOAD_MAX_CONCURRENT || "1", 10),
  TIMEOUT_MS: parseInt(process.env.UPLOAD_TIMEOUT_MS || "600000", 10),
  RATE_LIMIT_WINDOW_SECONDS: parseInt(
    process.env.UPLOAD_RATE_WINDOW_SECONDS || "60",
    10
  ),
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.UPLOAD_RATE_LIMIT || "10",
    10
  ),
  MAX_FIELDS: parseInt(process.env.UPLOAD_MAX_FIELDS || "10", 10),
  MAX_PARTS: parseInt(process.env.UPLOAD_MAX_PARTS || "20", 10),
  MAX_FIELD_SIZE_KB: parseInt(process.env.UPLOAD_MAX_FIELD_SIZE_KB || "100", 10),
  AI_IMAGE_MAX_CONCURRENT: parseInt(
    process.env.AI_IMAGE_MAX_CONCURRENT || "1",
    10
  ),
  AI_IMAGE_RATE_LIMIT: parseInt(process.env.AI_IMAGE_RATE_LIMIT || "5", 10),
  AI_IMAGE_RATE_WINDOW_SECONDS: parseInt(
    process.env.AI_IMAGE_RATE_WINDOW_SECONDS || "60",
    10
  ),
};
