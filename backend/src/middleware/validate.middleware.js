const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(StatusCodes.BAD_REQUEST).json({
    message: "Validation failed.",
    errors: errors.array()
  });
}

module.exports = { validateRequest };
