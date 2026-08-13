/**
 * One-shot repair: remove smoke-test probe strings from home hub pages + categories.
 * Usage: node src/scripts/repairCmsContent.js
 */
require("dotenv").config();
const connectDB = require("../config/db");
const { repairCorruptCmsContent } = require("./repairThailandTaxonomyLib");

async function main() {
  await connectDB();
  const report = await repairCorruptCmsContent("thailand-kitchen");
  console.log("CMS content repair complete:", report);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
