const authService = require("../services/auth.service");

async function register(req, res) {
  const response = await authService.register(req.body);
  res.status(201).json(response);
}

async function login(req, res) {
  const response = await authService.login(req.body);
  res.status(200).json(response);
}

async function getCurrentUser(req, res) {
  const user = await authService.getCurrentUser(req.user.sub);
  res.status(200).json({ user });
}

async function updateCurrentUser(req, res) {
  const user = await authService.updateCurrentUser(req.user.sub, req.body);
  res.status(200).json({ user });
}

async function changePassword(req, res) {
  await authService.changePassword(req.user.sub, req.body);
  res.status(200).json({ message: "Password updated successfully." });
}

async function verifyEmail(req, res) {
  const { token } = req.query;
  if (!token) {
    return res.redirect(`${process.env.CLIENT_URL}/login?verified=false`);
  }
  await authService.verifyEmail(token);
  res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
}

async function resendVerification(req, res) {
  await authService.resendVerification(req.body.email);
  res.status(200).json({ message: "Verification email sent." });
}

module.exports = { register, login, getCurrentUser, updateCurrentUser, changePassword, verifyEmail, resendVerification };
