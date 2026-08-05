const { body, validationResult } = require("express-validator");

const validateContact = [
  body("fullName").notEmpty().withMessage("Full Name is required"),
  body("email").isEmail().withMessage("Valid Email is required"),
  body("phoneNumber").notEmpty().withMessage("Phone Number is required"),
  body("whatsappNumber").customSanitizer((value, { req }) => {
    const phone = String(req.body.phoneNumber || "").trim();
    const wa = String(value || "").trim();
    return wa || phone;
  }),
  body("cityName").customSanitizer((value) => {
    const v = String(value || "").trim();
    return v || "Not provided";
  }),
  body("countryName").customSanitizer((value) => {
    const v = String(value || "").trim();
    return v || "Not provided";
  }),
  body("message").customSanitizer((value, { req }) => {
    const v = String(value || "").trim();
    if (v) return v;
    const name = String(req.body.fullName || "visitor").trim();
    return `Contact inquiry from ${name}. Please follow up regarding kitchen consultation.`;
  }),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0]?.msg || "Validation failed",
        errors: errors.array(),
      });
    }

    next();
  },
];

module.exports = validateContact;
