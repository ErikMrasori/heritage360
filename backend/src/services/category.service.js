const categoryModel = require("../models/category.model");

async function getCategories() {
  return categoryModel.findAll();
}

module.exports = { getCategories };
