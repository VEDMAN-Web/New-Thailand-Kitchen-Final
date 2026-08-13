/**
 * Safe gallery sync — creates missing seed photos only (by title + filter).
 * Never overwrites existing gallery rows.
 */
const { GalleryItem } = require("../model/cmsModels");
const { asLocalized } = require("../utils/localized");

function titleEn(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return String(value.en || value.th || value.pl || "").trim();
  }
  return String(value || "").trim();
}

async function syncGalleryMissingOnly(siteId, defaults = []) {
  let created = 0;
  let existing = 0;

  for (const row of defaults) {
    const title = String(row.title || "").trim();
    const filter = String(row.filter || "").trim();
    if (!title) continue;

    const found = await GalleryItem.findOne({
      siteId,
      filter,
      $or: [
        { "title.en": title },
        { title },
      ],
    }).select("_id");

    if (found) {
      existing += 1;
      continue;
    }

    await GalleryItem.create({
      siteId,
      title: asLocalized(title),
      image: String(row.image || ""),
      filter,
      tall: Boolean(row.tall),
      wide: Boolean(row.wide),
      sortOrder: Number(row.sortOrder) || 0,
    });
    created += 1;
  }

  return {
    created,
    existing,
    total: await GalleryItem.countDocuments({ siteId }),
  };
}

module.exports = { syncGalleryMissingOnly, titleEn };
