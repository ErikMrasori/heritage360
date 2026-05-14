const express = require("express");
const visitsController = require("../controllers/visits.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { ApiError } = require("../utils/api-error");

const router = express.Router();

router.get("/:id/visited", authenticate, asyncHandler(async (req, res, next) => {
  const isSelf = Number(req.params.id) === Number(req.user.sub);
  const isAdmin = req.user.role === "admin";

  if (!isSelf && !isAdmin) {
    return next(new ApiError(403, "You can only view your own visited locations."));
  }

  return visitsController.getVisited(req, res, next);
}));

module.exports = router;
