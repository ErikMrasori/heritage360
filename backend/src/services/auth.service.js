const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");
const { createUser, findByEmail } = require("../models/user.model");
const { findByName } = require("../models/role.model");
const { signToken } = require("../utils/jwt");
const { ApiError } = require("../utils/api-error");

function buildAuthResponse(user) {
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role || "user"
  });

  return {
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at
    }
  };
}

async function register(payload) {
  const existingUser = await findByEmail(payload.email);
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, "A user with that email already exists.");
  }

  const role = await findByName("user");
  const passwordHash = await bcrypt.hash(payload.password, 12);
  const user = await createUser({
    fullName: payload.fullName,
    email: payload.email,
    passwordHash,
    roleId: role.id
  });

  return buildAuthResponse({ ...user, role: role.name });
}

async function login(payload) {
  const user = await findByEmail(payload.email);
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  return buildAuthResponse(user);
}

module.exports = { register, login };
