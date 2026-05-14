const visitService = require("../services/visit.service");

async function createVisit(req, res) {
  const visit = await visitService.createVisit(req.body, req.user.sub);
  res.status(201).json(visit);
}

async function getVisited(req, res) {
  const data = await visitService.getVisitedLocations(req.params.id);
  res.status(200).json(data);
}

async function deleteVisit(req, res) {
  const data = await visitService.deleteVisit(Number(req.params.locationId), req.user.sub);
  res.status(200).json(data);
}

module.exports = { createVisit, deleteVisit, getVisited };
