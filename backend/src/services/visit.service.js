const { StatusCodes } = require("http-status-codes");
const visitModel = require("../models/visit.model");
const { findById } = require("../models/user.model");
const locationModel = require("../models/location.model");
const { ApiError } = require("../utils/api-error");

async function createVisit(payload, userId) {
  const location = await locationModel.findById(payload.locationId);
  if (!location) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Location not found.");
  }

  return visitModel.createVisit({
    userId,
    locationId: payload.locationId
  });
}

async function getVisitedLocations(userId) {
  const user = await findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
  }
  return visitModel.findVisitedByUserId(userId);
}

module.exports = { createVisit, getVisitedLocations };
