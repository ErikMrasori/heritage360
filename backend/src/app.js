const compression = require("compression");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { env } = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const locationsRoutes = require("./routes/locations.routes");
const categoriesRoutes = require("./routes/categories.routes");
const visitsRoutes = require("./routes/visits.routes");
const usersRoutes = require("./routes/users.routes");
const uploadRoutes = require("./routes/upload.routes");
const suggestionsRoutes = require("./routes/suggestions.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const plannerRoutes = require("./routes/planner.routes");
const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");

const app = express();

app.use(
  helmet({
    // Frontend and backend run on different local origins in development (4200/4000),
    // so uploaded media must be embeddable cross-origin.
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(cors({ origin: env.clientUrl, credentials: false }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

// Serve uploaded files from the repo-level uploads directory.
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/locations/:id/reviews", reviewsRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/visits", visitsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/suggestions", suggestionsRoutes);
app.use("/api/planner", plannerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
