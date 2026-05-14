const { body } = require("express-validator");

const createVisitValidator = [body("locationId").isInt({ min: 1 }).withMessage("locationId is required.")];

module.exports = { createVisitValidator };
