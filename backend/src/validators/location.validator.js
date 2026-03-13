const { body } = require("express-validator");

const mediaValidator = body("media")
  .optional()
  .isArray()
  .withMessage("Media must be an array.")
  .custom((media) =>
    media.every(
      (item) =>
        ["image", "video"].includes(item.mediaType) &&
        typeof item.mediaUrl === "string" &&
        item.mediaUrl.length > 0
    )
  )
  .withMessage("Each media item must include mediaType and mediaUrl.");

const locationValidator = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("city").trim().notEmpty().withMessage("City is required."),
  body("address").trim().notEmpty().withMessage("Address is required."),
  body("latitude").isFloat({ min: -90, max: 90 }).withMessage("Latitude must be valid."),
  body("longitude").isFloat({ min: -180, max: 180 }).withMessage("Longitude must be valid."),
  body("categoryId").isInt({ min: 1 }).withMessage("categoryId is required."),
  mediaValidator
];

module.exports = { locationValidator };
