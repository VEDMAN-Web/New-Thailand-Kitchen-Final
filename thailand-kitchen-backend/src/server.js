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

const startServer = async () => {
  try {
    await ConnectDB();
    await ensureAdmin();

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
