const suggestionService = require("../services/suggestion.service");

async function createSuggestion(req, res) {
  const suggestion = await suggestionService.createSuggestion(req.body);
  res.status(201).json({ suggestion });
}

module.exports = { createSuggestion };
