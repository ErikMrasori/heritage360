const { pool } = require("../config/db");

function mapReviewRow(row) {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    locationId: Number(row.location_id),
    rating: Number(row.rating),
    body: row.body,
    createdAt: row.created_at,
    userName: row.user_name
  };
}

async function findByLocationId(locationId) {
  const query = `
    SELECT r.id, r.user_id, r.location_id, r.rating, r.body, r.created_at,
           u.full_name AS user_name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.location_id = $1
    ORDER BY r.created_at DESC
  `;
  const result = await pool.query(query, [locationId]);
  return result.rows.map(mapReviewRow);
}

async function findByUserId(userId) {
  const query = `
    SELECT r.id, r.user_id, r.location_id, r.rating, r.body, r.created_at,
           u.full_name AS user_name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows.map(mapReviewRow);
}

async function findByUserAndLocation(userId, locationId) {
  const query = `
    SELECT id FROM reviews WHERE user_id = $1 AND location_id = $2 LIMIT 1
  `;
  const result = await pool.query(query, [userId, locationId]);
  return result.rows[0] || null;
}

async function create({ userId, locationId, rating, body }) {
  const query = `
    INSERT INTO reviews (user_id, location_id, rating, body)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, location_id, rating, body, created_at
  `;
  const result = await pool.query(query, [userId, locationId, rating, body]);
  const row = result.rows[0];
  const enriched = await pool.query(
    `SELECT u.full_name AS user_name FROM users u WHERE u.id = $1`,
    [userId]
  );
  return mapReviewRow({ ...row, user_name: enriched.rows[0]?.user_name });
}

module.exports = { findByLocationId, findByUserId, findByUserAndLocation, create };
