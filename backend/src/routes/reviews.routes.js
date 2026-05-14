const express = require("express");
const reviewsController = require("../controllers/reviews.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validate.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { createReviewValidator } = require("../validators/review.validator");

const router = express.Router({ mergeParams: true });

router.get("/", asyncHandler(reviewsController.getReviews));
router.post(
  "/",
  authenticate,
  createReviewValidator,
  validateRequest,
  asyncHandler(reviewsController.createReview)
);

module.exports = router;
