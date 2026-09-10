/**
 * Collect CMS image URLs for VIS-28 audits.
 */
function collect(value, rows, source) {
  if (value == null) return;
  if (typeof value === "string") {
    const url = value.trim();
    if (
      /\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(url) ||
      /\/(uploads|products|blog|catlog|features|gallery|slider)\//i.test(url)
    ) {
      rows.push({ source, url });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, i) => collect(entry, rows, `${source}[${i}]`));
    return;
  }
  if (typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      collect(entry, rows, `${source}.${key}`);
    }
  }
}

function absoluteUrl(url, mediaBase) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = String(mediaBase || "").replace(/\/+$/, "");
  if (!base) return url;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function uniqueRows(rows) {
  const seen = new Set();
  const unique = [];
  for (const row of rows) {
    if (seen.has(row.url)) continue;
    seen.add(row.url);
    unique.push(row);
  }
  return unique;
}

function toCsv(rows, mediaBase) {
  const lines = ["source,url,absolute_url"];
  for (const row of uniqueRows(rows)) {
    const abs = absoluteUrl(row.url, mediaBase);
    lines.push(
      [row.source, row.url, abs]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
  }
  return `${lines.join("\n")}\n`;
}

module.exports = { collect, absoluteUrl, uniqueRows, toCsv };
