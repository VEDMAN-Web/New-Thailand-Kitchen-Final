const express = require("express");
const validateMiddleWare = require("../middleware/validateMiddle");
const contactUsController = require("../controller/contactUsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public: website enquiry forms
router.post("/post", validateMiddleWare, contactUsController.createContact);

// Admin: manage leads
router.get("/get", protect, contactUsController.getContacts);
router.get("/getByID/:id", protect, contactUsController.getContactById);
router.put("/put/:id", protect, validateMiddleWare, contactUsController.updateContact);
router.delete("/delete/:id", protect, contactUsController.deleteContact);

module.exports = router;
