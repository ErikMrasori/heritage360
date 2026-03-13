const { StatusCodes } = require("http-status-codes");

function notFoundHandler(_req, res) {
  res.status(StatusCodes.NOT_FOUND).json({ message: "Route not found." });
}

function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message =
    statusCode === StatusCodes.INTERNAL_SERVER_ERROR ? "An unexpected error occurred." : error.message;

  if (statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
    console.error(error);
  }

  res.status(statusCode).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
