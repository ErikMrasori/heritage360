const express = require("express");
const categoriesController = require("../controllers/categories.controller");
const { asyncHandler } = require("../utils/async-handler");

const router = express.Router();

router.get("/", asyncHandler(categoriesController.getCategories));

module.exports = router;
