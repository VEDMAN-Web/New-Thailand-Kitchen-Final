require("dotenv").config();
const ConnectDB = require("../config/db");
const AdminUser = require("../model/adminUserModel");

async function seed() {
  await ConnectDB();

  const email = (
    process.env.ADMIN_EMAIL || "admin@thailandkitchens.com"
  ).toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin";

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  await AdminUser.create({
    name,
    email,
    password,
    role: "admin",
  });

  console.log(`Seeded admin user: ${email} / ${password}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
