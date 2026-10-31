#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const checks = [];

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  checks.push({
    description,
    status: exists ? "✓" : "✗",
    path: filePath,
  });
  return exists;
}

function checkImport(modulePath, description) {
  try {
    require.resolve(modulePath);
    checks.push({ description, status: "✓" });
    return true;
  } catch (e) {
    checks.push({ description, status: "✗", error: e.message });
    return false;
  }
}

console.log("\n🔍 Verifying Upload Safety System Implementation\n");

// Check configuration files
checkFile("src/config/uploadLimits.js", "Upload limits configuration");
checkFile("src/config/upload.js", "Upload config (updated)");

// Check middleware
checkFile("src/middleware/uploadMiddleware.js", "Upload middleware");

// Check utilities
checkFile("src/utils/rateLimiter.js", "Rate limiter utility");
checkFile("src/utils/concurrencyLimiter.js", "Concurrency limiter utility");

// Check modified files
checkFile("src/controller/uploadController.js", "Upload controller (updated)");
checkFile("src/controller/aiController.js", "AI controller (updated)");
checkFile("src/router/uploadRouter.js", "Upload router (updated)");
checkFile("src/router/cmsRouter.js", "CMS router (updated)");

// Check documentation
checkFile("UPLOAD_SAFETY.md", "Comprehensive documentation");
checkFile("UPLOAD_IMPLEMENTATION.md", "Implementation summary");

// Check tests
checkFile("tests/upload.test.js", "Unit tests");

// Check scripts
checkFile("scripts/loadTestUpload.js", "Load test script");

// Check environment config
checkFile(".env.example", "Environment example (updated)");

// Try to import modules
console.log("\n📦 Checking Module Imports\n");

const baseDir = path.join(__dirname, "..");
checkImport(path.join(baseDir, "src/config/uploadLimits"), "Upload limits module");
checkImport(path.join(baseDir, "src/utils/rateLimiter"), "Rate limiter module");
checkImport(path.join(baseDir, "src/utils/concurrencyLimiter"), "Concurrency limiter module");
checkImport(path.join(baseDir, "src/middleware/uploadMiddleware"), "Upload middleware module");

// Print results
console.log("\n" + "═".repeat(70));
console.log("📋 VERIFICATION RESULTS");
console.log("═".repeat(70) + "\n");

checks.forEach((check) => {
  const statusIcon = check.status === "✓" ? "✓" : "✗";
  const statusColor = check.status === "✓" ? "\x1b[32m" : "\x1b[31m";
  const reset = "\x1b[0m";

  console.log(
    `${statusColor}${statusIcon}${reset} ${check.description.padEnd(50)}`
  );
  if (check.path) {
    console.log(`  └─ ${check.path}`);
  }
  if (check.error) {
    console.log(`  └─ Error: ${check.error}`);
  }
});

console.log("\n" + "═".repeat(70));

const passed = checks.filter((c) => c.status === "✓").length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(
  `Results: ${passed}/${total} passed (${percentage}%)\n`
);

if (percentage === 100) {
  console.log("✅ All verification checks passed!\n");
  console.log("Next steps:");
  console.log("  1. Review UPLOAD_SAFETY.md for operational details");
  console.log("  2. Run: npm test tests/upload.test.js");
  console.log("  3. Run: npm run dev");
  console.log("  4. Test locally with: node scripts/loadTestUpload.js\n");
  process.exit(0);
} else {
  console.log("❌ Some checks failed. Review above.\n");
  process.exit(1);
}
