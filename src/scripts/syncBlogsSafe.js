/**
 * Safe blog sync — creates missing seed guide posts only (by slug).
 * Never overwrites existing blog rows.
 */
const { Blog } = require("../model/cmsModels");

function contentFromBodySections(sections) {
  if (!Array.isArray(sections)) return "";
  return sections
    .map((s) => [s?.title, s?.content].filter(Boolean).join("\n"))
    .filter(Boolean)
    .join("\n\n");
}

async function syncBlogsMissingOnly(siteId, defaults = []) {
  let created = 0;
  let existing = 0;

  const rows = await Blog.find({ siteId }).select("slug").lean();
  const existingSlugs = new Set(
    rows.map((b) => String(b.slug || "").trim().toLowerCase())
  );

  for (const b of defaults) {
    const slug = String(b.slug || "").trim().toLowerCase();
    if (!slug) continue;

    if (existingSlugs.has(slug)) {
      existing += 1;
      continue;
    }

    await Blog.create({
      siteId,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: contentFromBodySections(b.bodySections) || b.excerpt,
      image: b.image,
      gallery: b.gallery || [],
      category: b.category || "",
      author: b.author || "",
      readTime: b.readTime || "",
      publishDate: b.publishDate || "",
      bodySections: b.bodySections || [],
      highlightTitle: b.highlightTitle || "",
      highlightText: b.highlightText || "",
      quote: b.quote || "",
      quoteAuthor: b.quoteAuthor || "",
      published: b.published !== false,
    });
    existingSlugs.add(slug);
    created += 1;
  }

  return {
    created,
    existing,
    total: await Blog.countDocuments({ siteId }),
  };
}

module.exports = { syncBlogsMissingOnly, contentFromBodySections };
