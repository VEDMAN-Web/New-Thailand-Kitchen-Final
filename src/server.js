require("dotenv").config();
const app = require("./app");
const ConnectDB = require("./config/db");
const AdminUser = require("./model/adminUserModel");

const PORT = process.env.PORT || 5000;

async function ensureAdmin() {
  const email = (
    process.env.ADMIN_EMAIL || "admin@thailandkitchens.com"
  ).toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin";

  const existing = await AdminUser.findOne({ email });
  if (!existing) {
    await AdminUser.create({ name, email, password, role: "admin" });
    console.log(`Seeded default admin: ${email}`);
  }
}

async function ensureCmsIndexes() {
  try {
    const mongoose = require("mongoose");
    const col = mongoose.connection.collection("cmscategories");
    const indexes = await col.indexes();

    // Drop legacy unique { siteId, slug } that blocked same slug across types
    for (const idx of indexes) {
      const key = idx.key || {};
      const isLegacySiteSlug =
        idx.name === "siteId_1_slug_1" ||
        (key.siteId === 1 &&
          key.slug === 1 &&
          key.categoryType === undefined &&
          idx.unique);
      if (isLegacySiteSlug) {
        await col.dropIndex(idx.name);
        console.log(`Dropped legacy category index: ${idx.name}`);
      }
    }

    // Drop old unique compound without parentId (blocks same service slug under locations)
    for (const idx of indexes) {
      const key = idx.key || {};
      const isOldSlugOnly =
        idx.name === "siteId_1_categoryType_1_slug_1" ||
        (key.siteId === 1 &&
          key.categoryType === 1 &&
          key.slug === 1 &&
          key.parentId === undefined &&
          idx.unique);
      if (isOldSlugOnly) {
        await col.dropIndex(idx.name);
        console.log(`Dropped non-parent category unique index: ${idx.name}`);
      }
    }

    const { Category, CmsDeletion } = require("./model/cmsModels");
    await Category.createIndexes();
    await CmsDeletion.createIndexes();
    console.log("Category indexes ready");
  } catch (err) {
    console.log(
      `Category index sync skipped: ${err && err.message ? err.message : err}`
    );
  }
}

const startServer = async () => {
  try {
    await ConnectDB();
    await ensureAdmin();
    await ensureCmsIndexes();

    // Vercel/serverless: export app only; local: listen
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server is Running at ${PORT}`);
      });
    }
  } catch (error) {
    console.log(error.message);
    if (!process.env.VERCEL) process.exit(1);
  }
};

startServer();

module.exports = app;
