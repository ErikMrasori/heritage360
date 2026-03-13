const { StatusCodes } = require("http-status-codes");
const { verifyToken } = require("../utils/jwt");
const { ApiError } = require("../utils/api-error");

function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required."));
  }

  try {
    // JWT carries the authenticated user id and role for downstream authorization checks.
    const token = authHeader.replace("Bearer ", "");
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token."));
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(StatusCodes.FORBIDDEN, "You do not have permission to perform this action."));
    }

    return next();
  };
}

module.exports = { authenticate, authorize };
