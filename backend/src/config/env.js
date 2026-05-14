const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:4200",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 150),
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL || "Heritage360 <onboarding@resend.dev>",
  appUrl: process.env.APP_URL || `http://localhost:${Number(process.env.PORT || 4000)}`
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is required.");
}

module.exports = { env };
