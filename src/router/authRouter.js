const express = require("express");
const authController = require("../controller/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", authController.login);
router.get("/me", protect, authController.me);
router.get("/users", protect, authController.listUsers);
router.post("/users", protect, authController.createUser);
router.delete("/users/:id", protect, authController.deleteUser);

module.exports = router;
