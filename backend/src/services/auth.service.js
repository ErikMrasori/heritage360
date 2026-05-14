const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");
const {
  createUser,
  findByEmail,
  findById,
  findByVerificationToken,
  markVerified,
  updateVerificationToken,
  updateUserPassword,
  updateUserProfile
} = require("../models/user.model");
const { findByName } = require("../models/role.model");
const { signToken } = require("../utils/jwt");
const { ApiError } = require("../utils/api-error");
const { sendVerificationEmail } = require("./email.service");

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
      bio: user.bio || "",
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
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
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await createUser({
    fullName: payload.fullName,
    bio: "",
    email: payload.email,
    passwordHash,
    roleId: role.id,
    verificationToken,
    verificationTokenExpiresAt
  });

  const emailConfigured = Boolean(process.env.RESEND_API_KEY);

  if (!emailConfigured) {
    await markVerified(user.id);
    const verified = await findByEmail(user.email);
    return buildAuthResponse(verified);
  }

  try {
    await sendVerificationEmail(user.email, user.full_name, verificationToken);
  } catch (err) {
    console.error("Failed to send verification email:", err.message);
    throw new ApiError(StatusCodes.BAD_GATEWAY, `Could not send verification email: ${err.message}`);
  }

  return { message: "Check your email to verify your account." };
}

async function login(payload) {
  const user = await findByEmail(payload.email);
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  if (user.is_verified === false && user.role !== "admin") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Please verify your email before logging in.");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  return buildAuthResponse(user);
}

async function getCurrentUser(userId) {
  const user = await findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
  }

  return buildAuthResponse(user).user;
}

async function updateCurrentUser(userId, payload) {
  const user = await findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
  }

  const updatedUser = await updateUserProfile(userId, {
    fullName: payload.fullName.trim(),
    bio: (payload.bio || "").trim()
  });

  return buildAuthResponse({ ...user, ...updatedUser }).user;
}

async function changePassword(userId, payload) {
  const currentUser = await findById(userId);

  if (!currentUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
  }

  const loginUser = await findByEmail(currentUser.email);
  const isPasswordValid = await bcrypt.compare(payload.currentPassword, loginUser.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Current password is incorrect.");
  }

  const passwordHash = await bcrypt.hash(payload.newPassword, 12);
  await updateUserPassword(userId, passwordHash);
}

async function verifyEmail(token) {
  const user = await findByVerificationToken(token);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired verification link.");
  }

  if (new Date() > new Date(user.verification_token_expires_at)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Verification link has expired. Please request a new one.");
  }

  await markVerified(user.id);
}

async function resendVerification(email) {
  const user = await findByEmail(email);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No account found with that email.");
  }

  if (user.is_verified) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "This account is already verified.");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await updateVerificationToken(user.id, verificationToken, verificationTokenExpiresAt);

  try {
    await sendVerificationEmail(user.email, user.full_name, verificationToken);
  } catch (err) {
    console.error("Failed to resend verification email:", err.message);
    throw new ApiError(StatusCodes.BAD_GATEWAY, `Could not send verification email: ${err.message}`);
  }
}

module.exports = { register, login, getCurrentUser, updateCurrentUser, changePassword, verifyEmail, resendVerification };
