const asyncHandler = require("../utils/asyncHandler");
const AdminUser = require("../model/adminUserModel");
const { signToken } = require("../middleware/authMiddleware");

const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  const user = await AdminUser.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const token = signToken(user);
  return res.json({ success: true, token, user: user.toPublic() });
});

const me = asyncHandler(async (req, res) => {
  return res.json({ success: true, user: req.admin.toPublic() });
});

const listUsers = asyncHandler(async (_req, res) => {
  const users = await AdminUser.find().sort({ createdAt: -1 });
  return res.json({
    success: true,
    users: users.map((u) => u.toPublic()),
  });
});

const createUser = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "");
  const role = req.body.role === "editor" ? "editor" : "admin";

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }

  const exists = await AdminUser.findOne({ email });
  if (exists) {
    return res
      .status(409)
      .json({ success: false, message: "Email already exists" });
  }

  const user = await AdminUser.create({ name, email, password, role });
  return res.status(201).json({ success: true, user: user.toPublic() });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.admin._id) === String(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "You cannot delete your own account" });
  }

  const deleted = await AdminUser.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.json({ success: true, message: "User deleted" });
});

module.exports = {
  login,
  me,
  listUsers,
  createUser,
  deleteUser,
};
