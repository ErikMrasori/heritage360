const express = require("express");
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validate.middleware");
const { asyncHandler } = require("../utils/async-handler");
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator
} = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", registerValidator, validateRequest, asyncHandler(authController.register));
router.post("/login", loginValidator, validateRequest, asyncHandler(authController.login));
router.get("/verify-email", asyncHandler(authController.verifyEmail));
router.post("/resend-verification", asyncHandler(authController.resendVerification));
router.get("/me", authenticate, asyncHandler(authController.getCurrentUser));
router.patch("/me", authenticate, updateProfileValidator, validateRequest, asyncHandler(authController.updateCurrentUser));
router.patch("/password", authenticate, changePasswordValidator, validateRequest, asyncHandler(authController.changePassword));

module.exports = router;
