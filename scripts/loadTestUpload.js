#!/usr/bin/env node

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const API_URL = process.env.API_URL || "http://localhost:5000";
const JWT_TOKEN = process.env.JWT_TOKEN || "test-token";
const CONCURRENT_REQUESTS = parseInt(process.env.CONCURRENT_REQUESTS || "5");
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS || "10");
const FILE_SIZE_MB = parseInt(process.env.FILE_SIZE_MB || "1");

const results = {
  total: 0,
  success: 0,
  failed: 0,
  rateLimited: 0,
  capacityExceeded: 0,
  errors: [],
  statusCodes: {},
  startTime: Date.now(),
  endTime: null,
  durations: [],
};

function createTestFile(sizeMB) {
  const sizeBytes = sizeMB * 1024 * 1024;
  const buffer = Buffer.alloc(sizeBytes);

  for (let i = 0; i < sizeBytes; i++) {
    buffer[i] = (i % 256);
  }

  return buffer;
}

function sendUploadRequest(index) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const urlObj = new URL(API_URL);
    const isHttps = urlObj.protocol === "https:";
    const client = isHttps ? https : http;

    const testFileBuffer = createTestFile(FILE_SIZE_MB);

    const form = new FormData();
    form.append("file", testFileBuffer, `test-${index}.png`);
    form.append("kind", "image");

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: "/api/upload",
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
        ...form.getHeaders(),
      },
    };

    const req = client.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const duration = Date.now() - startTime;
        results.durations.push(duration);
        results.statusCodes[res.statusCode] =
          (results.statusCodes[res.statusCode] || 0) + 1;

        if (res.statusCode === 201) {
          results.success += 1;
          console.log(`✓ Request ${index}: ${duration}ms (201 Created)`);
        } else if (res.statusCode === 429) {
          results.rateLimited += 1;
          console.log(`⚠ Request ${index}: ${duration}ms (429 Rate Limited)`);
        } else if (res.statusCode === 429 && data.includes("CAPACITY")) {
          results.capacityExceeded += 1;
          console.log(`⚠ Request ${index}: ${duration}ms (429 Capacity)`);
        } else {
          results.failed += 1;
          try {
            const parsed = JSON.parse(data);
            console.log(
              `✗ Request ${index}: ${duration}ms (${res.statusCode} ${parsed.code || "Error"})`
            );
            results.errors.push({
              index,
              status: res.statusCode,
              message: parsed.message,
            });
          } catch {
            console.log(`✗ Request ${index}: ${duration}ms (${res.statusCode})`);
            results.errors.push({ index, status: res.statusCode });
          }
        }

        results.total += 1;
        resolve();
      });
    });

    req.on("error", (err) => {
      results.failed += 1;
      results.total += 1;
      results.errors.push({ index, error: err.message });
      console.log(`✗ Request ${index}: Network error - ${err.message}`);
      resolve();
    });

    req.on("timeout", () => {
      results.failed += 1;
      results.total += 1;
      results.errors.push({ index, error: "Timeout" });
      console.log(`✗ Request ${index}: Timeout`);
      req.destroy();
      resolve();
    });

    req.setTimeout(15000);
    form.pipe(req);
  });
}

async function runLoadTest() {
  console.log("\n🚀 Starting Upload Load Test");
  console.log(`   API URL: ${API_URL}`);
  console.log(`   Concurrent Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`   Total Requests: ${TOTAL_REQUESTS}`);
  console.log(`   File Size: ${FILE_SIZE_MB}MB`);
  console.log("");

  let requestIndex = 0;

  while (requestIndex < TOTAL_REQUESTS) {
    const batch = [];

    for (
      let i = 0;
      i < CONCURRENT_REQUESTS && requestIndex < TOTAL_REQUESTS;
      i++
    ) {
      batch.push(sendUploadRequest(requestIndex));
      requestIndex += 1;
    }

    await Promise.all(batch);

    if (requestIndex < TOTAL_REQUESTS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  results.endTime = Date.now();
  const totalDuration = results.endTime - results.startTime;

  console.log("\n");
  console.log("═".repeat(60));
  console.log("📊 LOAD TEST RESULTS");
  console.log("═".repeat(60));
  console.log(`
Total Requests:        ${results.total}
Success (201):         ${results.success}
Rate Limited (429):    ${results.rateLimited}
Capacity Exceeded:     ${results.capacityExceeded}
Failed/Errors:         ${results.failed}
Success Rate:          ${((results.success / results.total) * 100).toFixed(2)}%

Timing:
  Total Duration:      ${totalDuration}ms
  Average Per Request: ${(totalDuration / results.total).toFixed(0)}ms
  Min Duration:        ${Math.min(...results.durations)}ms
  Max Duration:        ${Math.max(...results.durations)}ms
  Median Duration:     ${getMedian(results.durations)}ms

HTTP Status Codes:
${Object.entries(results.statusCodes)
  .map(([code, count]) => `  ${code}: ${count}`)
  .join("\n")}
`);

  if (results.errors.length > 0 && results.errors.length <= 10) {
    console.log("Recent Errors:");
    results.errors.slice(0, 10).forEach((err, i) => {
      if (err.error) {
        console.log(`  ${i + 1}. Request ${err.index}: ${err.error}`);
      } else {
        console.log(
          `  ${i + 1}. Request ${err.index}: [${err.status}] ${err.message}`
        );
      }
    });
  }

  console.log("═".repeat(60));

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

function getMedian(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

runLoadTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
