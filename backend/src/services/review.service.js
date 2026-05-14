const { StatusCodes } = require("http-status-codes");
const reviewModel = require("../models/review.model");
const locationModel = require("../models/location.model");
const { ApiError } = require("../utils/api-error");

async function getReviews(locationId) {
  const items = await reviewModel.findByLocationId(locationId);
  const total = items.length;
  const average = total
    ? items.reduce((sum, review) => sum + review.rating, 0) / total
    : 0;
  return {
    items,
    total,
    average: Math.round(average * 10) / 10
  };
}

async function createReview(payload, userId) {
  const location = await locationModel.findById(payload.locationId);
  if (!location) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Location not found.");
  }

  const existing = await reviewModel.findByUserAndLocation(userId, payload.locationId);
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, "You have already reviewed this location.");
  }

  return reviewModel.create({
    userId,
    locationId: payload.locationId,
    rating: payload.rating,
    body: payload.body ?? ""
  });
}

module.exports = { getReviews, createReview };
