const categoryService = require("../services/category.service");

async function getCategories(_req, res) {
  const categories = await categoryService.getCategories();
  res.status(200).json({ items: categories });
}

module.exports = { getCategories };
