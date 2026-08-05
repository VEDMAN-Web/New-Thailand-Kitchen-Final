require("dotenv").config();
const ConnectDB = require("./config/db");
const AdminUser = require("./model/adminUserModel");
const app = require("./app");

let ready;

async function ensureReady() {
  if (!ready) {
    ready = (async () => {
      await ConnectDB();
      const email = (
        process.env.ADMIN_EMAIL || "admin@thailandkitchens.com"
      ).toLowerCase();
      const existing = await AdminUser.findOne({ email });
      if (!existing) {
        await AdminUser.create({
          name: process.env.ADMIN_NAME || "Admin",
          email,
          password: process.env.ADMIN_PASSWORD || "admin123",
          role: "admin",
        });
      }
    })();
  }
  return ready;
}

module.exports = async (req, res) => {
  await ensureReady();
  return app(req, res);
};
