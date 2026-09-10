/**
 * Dev-cache helper (Windows).
 *
 * Cross-drive junctions for `.next/dev` (or subfolders) break Turbopack:
 * chunks on C: cannot resolve `react` / `next` from E: node_modules.
 * Keep `.next` on the project drive. Set NEXT_FAST_DEV_CACHE=1 only if the
 * whole project (including node_modules) lives on the same fast volume.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const brokenFast = path.join(rootDir, ".next-fast");
try {
  if (fs.existsSync(brokenFast)) {
    fs.rmSync(brokenFast, { force: true });
    console.log("[dev-perf] Removed obsolete .next-fast");
  }
} catch {
  /* ignore */
}

function isReparsePoint(target) {
  const out = spawnSync(
    "cmd",
    ["/c", "fsutil", "reparsepoint", "query", target],
    { encoding: "utf8" }
  );
  return out.status === 0;
}

const nextDevDir = path.join(rootDir, ".next", "dev");

// Strip any leftover cross-drive junctions from earlier experiments.
if (fs.existsSync(nextDevDir) && isReparsePoint(nextDevDir)) {
  try {
    fs.rmSync(nextDevDir, { force: true });
    console.log("[dev-perf] Removed unsafe .next/dev junction (use local .next)");
  } catch (err) {
    console.warn(
      `[dev-perf] Could not remove .next/dev junction (${err.code || err.message}). Stop next and delete it manually.`
    );
  }
} else if (fs.existsSync(nextDevDir)) {
  for (const name of ["cache", "server", "static", "build"]) {
    const p = path.join(nextDevDir, name);
    if (fs.existsSync(p) && isReparsePoint(p)) {
      try {
        fs.rmSync(p, { force: true });
        console.log(`[dev-perf] Removed unsafe junction: .next/dev/${name}`);
      } catch (err) {
        console.warn(
          `[dev-perf] Locked junction .next/dev/${name} (${err.code || err.message})`
        );
      }
    }
  }
}

if (process.env.NEXT_FAST_DEV_CACHE === "1") {
  console.warn(
    "[dev-perf] NEXT_FAST_DEV_CACHE=1 ignored: cross-drive .next breaks Turbopack with this project layout."
  );
}

console.log("[dev-perf] Using project-local .next (safe for Turbopack)");
