const { body } = require("express-validator");

const suggestionValidator = [
  body("fullName").trim().isLength({ min: 2, max: 150 }).withMessage("Full name is required."),
  body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("landmarkName").trim().isLength({ min: 2, max: 150 }).withMessage("Landmark name is required."),
  body("city").trim().isLength({ min: 2, max: 120 }).withMessage("City is required."),
  body("categoryId").optional({ nullable: true }).isInt({ min: 1 }).withMessage("Category must be valid."),
  body("message").trim().isLength({ min: 10, max: 1200 }).withMessage("Please add a short description.")
];

module.exports = { suggestionValidator };
