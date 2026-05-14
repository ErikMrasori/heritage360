const express = require("express");
const visitsController = require("../controllers/visits.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validate.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { createVisitValidator } = require("../validators/visit.validator");

const router = express.Router();

router.post("/", authenticate, createVisitValidator, validateRequest, asyncHandler(visitsController.createVisit));
router.delete("/:locationId", authenticate, asyncHandler(visitsController.deleteVisit));

module.exports = router;
