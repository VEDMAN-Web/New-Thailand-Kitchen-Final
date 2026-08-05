const jwt = require("jsonwebtoken");
const AdminUser = require("../model/adminUserModel");

function getJwtSecret() {
  return process.env.JWT_SECRET || "thailand-kitchens-admin-dev-secret";
}

function signToken(user) {
  return jwt.sign(
    { id: String(user._id), email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await AdminUser.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    req.admin = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

module.exports = { protect, signToken, getJwtSecret };
