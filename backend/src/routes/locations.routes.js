const express = require("express");
const locationsController = require("../controllers/locations.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validate.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { locationValidator } = require("../validators/location.validator");

const router = express.Router();

router.get("/", asyncHandler(locationsController.getLocations));
router.get("/:id", asyncHandler(locationsController.getLocationById));
router.post("/", authenticate, authorize("admin"), locationValidator, validateRequest, asyncHandler(locationsController.createLocation));
router.put("/:id", authenticate, authorize("admin"), locationValidator, validateRequest, asyncHandler(locationsController.updateLocation));
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(locationsController.deleteLocation));

module.exports = router;
