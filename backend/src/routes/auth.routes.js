const express = require("express");
const authController = require("../controllers/auth.controller");
const { validateRequest } = require("../middleware/validate.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { registerValidator, loginValidator } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", registerValidator, validateRequest, asyncHandler(authController.register));
router.post("/login", loginValidator, validateRequest, asyncHandler(authController.login));

module.exports = router;
