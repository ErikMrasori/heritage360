const authService = require("../services/auth.service");

async function register(req, res) {
  const response = await authService.register(req.body);
  res.status(201).json(response);
}

async function login(req, res) {
  const response = await authService.login(req.body);
  res.status(200).json(response);
}

module.exports = { register, login };
