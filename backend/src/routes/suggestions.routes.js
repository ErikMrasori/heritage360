const express = require("express");
const suggestionsController = require("../controllers/suggestions.controller");
const { validateRequest } = require("../middleware/validate.middleware");
const { asyncHandler } = require("../utils/async-handler");
const { suggestionValidator } = require("../validators/suggestion.validator");

const router = express.Router();

router.post("/", suggestionValidator, validateRequest, asyncHandler(suggestionsController.createSuggestion));

module.exports = router;
