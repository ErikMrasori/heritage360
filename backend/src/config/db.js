const { Pool } = require("pg");
const { env } = require("./env");

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : false
});

async function ensureSchemaCompatibility() {
  await pool.query(`
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT '';
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(64);
    ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMPTZ;
    ALTER TABLE IF EXISTS locations ADD COLUMN IF NOT EXISTS title_sq VARCHAR(150);
    ALTER TABLE IF EXISTS locations ADD COLUMN IF NOT EXISTS description_sq TEXT;
    ALTER TABLE IF EXISTS locations ADD COLUMN IF NOT EXISTS city_sq VARCHAR(120);
    ALTER TABLE IF EXISTS locations ADD COLUMN IF NOT EXISTS address_sq VARCHAR(255);
    CREATE TABLE IF NOT EXISTS reviews (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      body TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_reviews_user_location UNIQUE (user_id, location_id)
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_location_id ON reviews(location_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
  `);
}

module.exports = { pool, ensureSchemaCompatibility };
