const categoryService = require("../services/category.service");

async function getCategories(_req, res) {
  const categories = await categoryService.getCategories();
  res.status(200).json({ items: categories });
}

async function createCategory(req, res) {
  const category = await categoryService.createCategory(req.body.name);
  res.status(201).json(category);
}

async function updateCategory(req, res) {
  const category = await categoryService.updateCategory(req.params.id, req.body.name);
  res.status(200).json(category);
}

async function deleteCategory(req, res) {
  await categoryService.deleteCategory(req.params.id);
  res.status(204).send();
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
