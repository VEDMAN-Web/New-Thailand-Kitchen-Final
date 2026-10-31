/**
 * VIS-28 FE verify: every static media path referenced from src must exist under public/.
 * Usage: node scripts/verify-public-images.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const srcDir = path.join(root, "src");
const publicDir = path.join(root, "public");

const MEDIA_RE =
  /["'`](\/(?:[A-Za-z0-9._()%\-\s]+\/)*[A-Za-z0-9._()%\-\s]+\.(?:png|jpe?g|webp|svg|gif|avif|mp4|webm|pdf))["'`]/gi;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?|mts|cts|json)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const found = new Map();
for (const file of walk(srcDir)) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(MEDIA_RE)) {
    const rel = match[1].replace(/\\/g, "/");
    if (!found.has(rel)) found.set(rel, []);
    found.get(rel).push(path.relative(root, file));
  }
}

const missing = [];
const ok = [];
for (const rel of [...found.keys()].sort()) {
  const disk = path.join(publicDir, rel.replace(/^\//, ""));
  if (fs.existsSync(disk)) ok.push(rel);
  else missing.push({ rel, from: found.get(rel) });
}

console.log(`[VIS-28] Checked ${found.size} unique public media refs from src/`);
console.log(`[VIS-28] Present: ${ok.length}`);
console.log(`[VIS-28] Missing: ${missing.length}`);
for (const m of missing) {
  console.log(`  MISSING ${m.rel}`);
  console.log(`    from: ${m.from.slice(0, 3).join(", ")}`);
}

if (missing.length) {
  process.exitCode = 1;
} else {
  console.log("[VIS-28] FE static inventory: PASS (all referenced public assets exist)");
}
