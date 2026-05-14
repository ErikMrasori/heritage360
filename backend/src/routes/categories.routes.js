const express = require("express");
const categoriesController = require("../controllers/categories.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../utils/async-handler");

const router = express.Router();

router.get("/", asyncHandler(categoriesController.getCategories));
router.post("/", authenticate, authorize("admin"), asyncHandler(categoriesController.createCategory));
router.put("/:id", authenticate, authorize("admin"), asyncHandler(categoriesController.updateCategory));
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(categoriesController.deleteCategory));

module.exports = router;
