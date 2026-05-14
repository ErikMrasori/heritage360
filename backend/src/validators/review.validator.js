const { body } = require("express-validator");

const createReviewValidator = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("rating must be between 1 and 5."),
  body("body").optional({ nullable: true }).isString().isLength({ max: 2000 }).withMessage("body must be 2000 characters or fewer.")
];

module.exports = { createReviewValidator };
