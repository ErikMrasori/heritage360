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

  const visit = await visitModel.createVisit({
    userId,
    locationId: payload.locationId
  });
  const progress = await visitModel.getVisitProgress(userId);
  return { visit, progress };
}

async function getVisitedLocations(userId) {
  const user = await findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
  }
  const [items, progress] = await Promise.all([
    visitModel.findVisitedByUserId(userId),
    visitModel.getVisitProgress(userId)
  ]);
  return { items, progress };
}

async function deleteVisit(locationId, userId) {
  await visitModel.deleteVisit({ userId, locationId });
  const progress = await visitModel.getVisitProgress(userId);
  return { progress };
}

module.exports = { createVisit, deleteVisit, getVisitedLocations };
