/**
 * Repair Thailand Kitchen category taxonomy: remove legacy orphans, upsert full SEO tree.
 * Usage: node src/scripts/repairThailandTaxonomy.js
 */
require("dotenv").config();
const ConnectDB = require("../config/db");
const { repairThailandTaxonomy } = require("./repairThailandTaxonomyLib");

async function main() {
  await ConnectDB();
  const result = await repairThailandTaxonomy("thailand-kitchen");
  console.log(`Removed ${result.removed} legacy categories without slug/type`);
  console.log(`Upserted taxonomy rows: ${result.upserted}`);
  console.log(`Total categories: ${result.total}, with slug+type: ${result.withSlug}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
