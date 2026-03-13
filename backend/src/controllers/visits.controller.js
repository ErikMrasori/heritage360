const visitService = require("../services/visit.service");

async function createVisit(req, res) {
  const visit = await visitService.createVisit(req.body, req.user.sub);
  res.status(201).json(visit);
}

async function getVisited(req, res) {
  const visits = await visitService.getVisitedLocations(req.params.id);
  res.status(200).json({ items: visits });
}

module.exports = { createVisit, getVisited };
