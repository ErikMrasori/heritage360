const { pool } = require("../config/db");

async function createVisit({ userId, locationId }) {
  const query = `
    INSERT INTO visited_locations (user_id, location_id)
    VALUES ($1, $2)
    RETURNING id, user_id, location_id, visited_at
  `;
  const result = await pool.query(query, [userId, locationId]);
  return result.rows[0];
}

async function findVisitedByUserId(userId) {
  const query = `
    SELECT
      vl.id,
      vl.visited_at,
      l.id AS location_id,
      l.title,
      l.city,
      l.address,
      l.latitude,
      l.longitude,
      c.name AS category_name
    FROM visited_locations vl
    JOIN locations l ON l.id = vl.location_id
    JOIN categories c ON c.id = l.category_id
    WHERE vl.user_id = $1
    ORDER BY vl.visited_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

module.exports = { createVisit, findVisitedByUserId };
