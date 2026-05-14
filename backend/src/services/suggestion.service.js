const suggestionModel = require("../models/suggestion.model");

async function createSuggestion(payload) {
  return suggestionModel.createSuggestion(payload);
}

module.exports = { createSuggestion };
