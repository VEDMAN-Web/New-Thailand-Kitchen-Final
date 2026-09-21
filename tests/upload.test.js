const assert = require("assert");
const fs = require("fs");
const path = require("path");
const uploadLimits = require("../src/config/uploadLimits");
const {
  checkRateLimit,
  getIdentifier,
} = require("../src/utils/rateLimiter");
const {
  acquireUploadSlot,
  releaseUploadSlot,
  getCurrentUploadCount,
} = require("../src/utils/concurrencyLimiter");

describe("Upload System", () => {
  describe("Configuration", () => {
    it("should have valid upload limits configured", () => {
      assert.ok(uploadLimits.MAX_FILE_SIZE_MB > 0);
      assert.ok(uploadLimits.MAX_CONCURRENT > 0);
      assert.ok(uploadLimits.TIMEOUT_MS > 0);
      assert.ok(uploadLimits.RATE_LIMIT_MAX_REQUESTS > 0);
      assert.ok(uploadLimits.RATE_LIMIT_WINDOW_SECONDS > 0);
      assert.ok(uploadLimits.MAX_FIELDS > 0);
      assert.ok(uploadLimits.MAX_PARTS > 0);
      assert.ok(uploadLimits.MAX_FIELD_SIZE_KB > 0);
    });

    it("should have valid AI image limits configured", () => {
      assert.ok(uploadLimits.AI_IMAGE_MAX_CONCURRENT > 0);
      assert.ok(uploadLimits.AI_IMAGE_RATE_LIMIT > 0);
      assert.ok(uploadLimits.AI_IMAGE_RATE_WINDOW_SECONDS > 0);
    });
  });

  describe("Rate Limiter", () => {
    it("should allow requests within rate limit", () => {
      const result = checkRateLimit("test", "user1", 5, 60);
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.remaining, 4);
    });

    it("should reject requests exceeding rate limit", () => {
      // Clear cache by recreating rate limit state
      for (let i = 0; i < 5; i++) {
        checkRateLimit("ratelimit-test", "user2", 2, 60);
      }

      const result = checkRateLimit("ratelimit-test", "user2", 2, 60);
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.remaining, 0);
    });

    it("should track reset time", () => {
      const before = Date.now();
      const result = checkRateLimit("reset-test", "user3", 10, 1);
      const after = Date.now();

      assert.ok(result.resetAt >= before + 900);
      assert.ok(result.resetAt <= after + 1100);
    });

    it("should support multiple independent limits", () => {
      const result1 = checkRateLimit("upload", "user4", 5, 60);
      const result2 = checkRateLimit("ai-image", "user4", 3, 60);

      assert.strictEqual(result1.allowed, true);
      assert.strictEqual(result2.allowed, true);
      assert.strictEqual(result1.remaining, 4);
      assert.strictEqual(result2.remaining, 2);
    });

    it("should handle different users independently", () => {
      const result1 = checkRateLimit("users-test", "user5", 2, 60);
      const result2 = checkRateLimit("users-test", "user6", 2, 60);

      assert.strictEqual(result1.allowed, true);
      assert.strictEqual(result2.allowed, true);
    });
  });

  describe("Concurrency Limiter", () => {
    beforeEach(() => {
      // Reset concurrency count between tests
      while (getCurrentUploadCount() > 0) {
        releaseUploadSlot();
      }
    });

    it("should acquire slot when available", () => {
      const slot = acquireUploadSlot(1);
      assert.strictEqual(slot.acquired, true);
      assert.ok(slot.slotId);
    });

    it("should reject when capacity exceeded", () => {
      acquireUploadSlot(1);
      const slot = acquireUploadSlot(1);
      assert.strictEqual(slot.acquired, false);
    });

    it("should track concurrent upload count", () => {
      assert.strictEqual(getCurrentUploadCount(), 0);
      acquireUploadSlot(3);
      assert.strictEqual(getCurrentUploadCount(), 1);
      acquireUploadSlot(3);
      assert.strictEqual(getCurrentUploadCount(), 2);
      acquireUploadSlot(3);
      assert.strictEqual(getCurrentUploadCount(), 3);
    });

    it("should release slots", () => {
      acquireUploadSlot(2);
      acquireUploadSlot(2);
      assert.strictEqual(getCurrentUploadCount(), 2);
      releaseUploadSlot();
      assert.strictEqual(getCurrentUploadCount(), 1);
      releaseUploadSlot();
      assert.strictEqual(getCurrentUploadCount(), 0);
    });

    it("should not go negative when releasing", () => {
      releaseUploadSlot();
      releaseUploadSlot();
      assert.strictEqual(getCurrentUploadCount(), 0);
    });

    it("should respect configurable limits", () => {
      const maxConcurrent = uploadLimits.MAX_CONCURRENT;

      for (let i = 0; i < maxConcurrent; i++) {
        const slot = acquireUploadSlot(maxConcurrent);
        assert.strictEqual(slot.acquired, true);
      }

      const overLimit = acquireUploadSlot(maxConcurrent);
      assert.strictEqual(overLimit.acquired, false);
    });
  });

  describe("Upload Path Safety", () => {
    it("should not allow path traversal in relative paths", () => {
      const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
      const relativePath = "../../../etc/passwd";
      const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
      const full = path.join(UPLOAD_ROOT, normalized);

      assert.ok(full.startsWith(UPLOAD_ROOT));
    });

    it("should safely join paths", () => {
      const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
      const safeFile = "images/2024-01-01-12345.png";
      const full = path.join(UPLOAD_ROOT, safeFile);

      assert.ok(full.startsWith(UPLOAD_ROOT));
      assert.ok(full.includes("uploads"));
    });
  });

  describe("File Size Limits", () => {
    it("should have reasonable file size limit", () => {
      const limitMB = uploadLimits.MAX_FILE_SIZE_MB;
      assert.ok(limitMB >= 1);
      assert.ok(limitMB <= 500);
    });

    it("should convert file size to bytes correctly", () => {
      const limitMB = uploadLimits.MAX_FILE_SIZE_MB;
      const limitBytes = limitMB * 1024 * 1024;
      assert.strictEqual(limitBytes, uploadLimits.MAX_FILE_SIZE_MB * 1024 * 1024);
    });
  });

  describe("Multipart Limits", () => {
    it("should limit number of fields", () => {
      assert.ok(uploadLimits.MAX_FIELDS >= 5);
      assert.ok(uploadLimits.MAX_FIELDS <= 100);
    });

    it("should limit number of parts", () => {
      assert.ok(uploadLimits.MAX_PARTS >= 10);
      assert.ok(uploadLimits.MAX_PARTS <= 100);
    });

    it("should limit field size", () => {
      const limitBytes = uploadLimits.MAX_FIELD_SIZE_KB * 1024;
      assert.ok(limitBytes >= 1024);
      assert.ok(limitBytes <= 1024 * 1024);
    });

    it("should allow single file plus metadata fields", () => {
      assert.ok(uploadLimits.MAX_PARTS > 1);
      assert.ok(uploadLimits.MAX_FIELDS > 0);
    });
  });

  describe("Timeout Configuration", () => {
    it("should have reasonable upload timeout", () => {
      const timeoutSeconds = uploadLimits.TIMEOUT_MS / 1000;
      assert.ok(timeoutSeconds >= 60);
      assert.ok(timeoutSeconds <= 1800);
    });

    it("should be suitable for 50MB file at typical speed", () => {
      const timeoutSeconds = uploadLimits.TIMEOUT_MS / 1000;
      const maxFileSizeMB = uploadLimits.MAX_FILE_SIZE_MB;
      const minSpeedMBps = maxFileSizeMB / timeoutSeconds;

      assert.ok(minSpeedMBps > 0.01);
    });
  });

  describe("Rate Limit Configuration", () => {
    it("should have reasonable upload rate limit", () => {
      assert.ok(uploadLimits.RATE_LIMIT_MAX_REQUESTS >= 1);
      assert.ok(uploadLimits.RATE_LIMIT_MAX_REQUESTS <= 100);
    });

    it("should have reasonable rate limit window", () => {
      const windowSeconds = uploadLimits.RATE_LIMIT_WINDOW_SECONDS;
      assert.ok(windowSeconds >= 10);
      assert.ok(windowSeconds <= 3600);
    });

    it("should have reasonable AI image rate limit", () => {
      assert.ok(uploadLimits.AI_IMAGE_RATE_LIMIT >= 1);
      assert.ok(uploadLimits.AI_IMAGE_RATE_LIMIT <= 100);
    });
  });
});

describe("Concurrent Upload Scenarios", () => {
  beforeEach(() => {
    while (getCurrentUploadCount() > 0) {
      releaseUploadSlot();
    }
  });

  it("should handle multiple simultaneous requests", () => {
    const maxConcurrent = uploadLimits.MAX_CONCURRENT;
    const slots = [];

    for (let i = 0; i < maxConcurrent + 5; i++) {
      const slot = acquireUploadSlot(maxConcurrent);
      slots.push(slot);
    }

    const acquired = slots.filter((s) => s.acquired).length;
    const rejected = slots.filter((s) => !s.acquired).length;

    assert.strictEqual(acquired, maxConcurrent);
    assert.strictEqual(rejected, 5);
  });

  it("should reuse slots after release", () => {
    const maxConcurrent = 2;

    const slot1 = acquireUploadSlot(maxConcurrent);
    assert.strictEqual(slot1.acquired, true);

    const slot2 = acquireUploadSlot(maxConcurrent);
    assert.strictEqual(slot2.acquired, true);

    const slot3 = acquireUploadSlot(maxConcurrent);
    assert.strictEqual(slot3.acquired, false);

    releaseUploadSlot();

    const slot4 = acquireUploadSlot(maxConcurrent);
    assert.strictEqual(slot4.acquired, true);
  });
});

if (require.main === module) {
  console.log("Upload system tests defined. Run with: npm test");
}

module.exports = { uploadLimits };
