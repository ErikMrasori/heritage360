const locationService = require("../services/location.service");

async function getLocations(req, res) {
  const data = await locationService.getLocations(req.query);
  res.status(200).json(data);
}

async function getLocationById(req, res) {
  const location = await locationService.getLocationById(req.params.id);
  res.status(200).json(location);
}

async function createLocation(req, res) {
  const location = await locationService.createLocation(req.body, req.user.sub);
  res.status(201).json(location);
}

async function updateLocation(req, res) {
  const location = await locationService.updateLocation(req.params.id, req.body, req.user.sub);
  res.status(200).json(location);
}

async function deleteLocation(req, res) {
  await locationService.deleteLocation(req.params.id, req.user.sub);
  res.status(204).send();
}

module.exports = { getLocations, getLocationById, createLocation, updateLocation, deleteLocation };
