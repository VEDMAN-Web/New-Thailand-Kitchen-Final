/**
 * Safe FAQ sync — creates missing seed FAQ rows only (by English question text).
 * Never overwrites existing FAQ rows.
 */
const { FaqItem } = require("../model/cmsModels");

function questionEn(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return String(value.en || value.th || value.pl || "").trim();
  }
  return String(value || "").trim();
}

async function syncFaqsMissingOnly(siteId, defaults = []) {
  let created = 0;
  let existing = 0;

  const rows = await FaqItem.find({ siteId }).select("question").lean();
  const existingQuestions = new Set(rows.map((f) => questionEn(f.question)));

  for (const f of defaults) {
    const q = questionEn(f.question);
    if (!q) continue;

    if (existingQuestions.has(q)) {
      existing += 1;
      continue;
    }

    await FaqItem.create({
      siteId,
      question: f.question,
      answer: f.answer,
      sortOrder: Number(f.sortOrder) || 0,
    });
    existingQuestions.add(q);
    created += 1;
  }

  return {
    created,
    existing,
    total: await FaqItem.countDocuments({ siteId }),
  };
}

module.exports = { syncFaqsMissingOnly, questionEn };
