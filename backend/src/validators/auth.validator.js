const { body } = require("express-validator");

const registerValidator = [
  body("fullName").trim().notEmpty().withMessage("Full name is required."),
  body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.")
];

const loginValidator = [
  body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required.")
];

const updateProfileValidator = [
  body("fullName").trim().notEmpty().withMessage("Full name is required."),
  body("bio").optional({ values: "falsy" }).isLength({ max: 600 }).withMessage("Bio must be 600 characters or fewer.")
];

const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required."),
  body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters long.")
];

module.exports = { registerValidator, loginValidator, updateProfileValidator, changePasswordValidator };
