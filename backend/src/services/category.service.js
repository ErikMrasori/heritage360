const { StatusCodes } = require("http-status-codes");
const categoryModel = require("../models/category.model");
const { ApiError } = require("../utils/api-error");

async function getCategories() {
  return categoryModel.findAll();
}

async function createCategory(name) {
  if (!name?.trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category name is required.");
  }
  return categoryModel.create(name.trim());
}

async function updateCategory(id, name) {
  if (!name?.trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category name is required.");
  }
  const category = await categoryModel.findById(id);
  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, "Category not found.");
  return categoryModel.update(id, name.trim());
}

async function deleteCategory(id) {
  const category = await categoryModel.findById(id);
  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, "Category not found.");
  await categoryModel.remove(id);
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
