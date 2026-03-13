const compression = require("compression");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { env } = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const locationsRoutes = require("./routes/locations.routes");
const categoriesRoutes = require("./routes/categories.routes");
const visitsRoutes = require("./routes/visits.routes");
const usersRoutes = require("./routes/users.routes");
const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: false
  })
);
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

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/visits", visitsRoutes);
app.use("/api/users", usersRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
