const express = require("express");
const authController = require("../controller/authController");
const { protect, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", authController.login);
router.get("/me", protect, authController.me);
router.get("/users", protect, requireAdmin, authController.listUsers);
router.post("/users", protect, requireAdmin, authController.createUser);
router.delete("/users/:id", protect, requireAdmin, authController.deleteUser);

module.exports = router;
