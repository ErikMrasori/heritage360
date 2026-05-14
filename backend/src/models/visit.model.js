const { pool } = require("../config/db");

async function createVisit({ userId, locationId }) {
  const query = `
    WITH inserted AS (
      INSERT INTO visited_locations (user_id, location_id)
      SELECT $1, $2
      WHERE NOT EXISTS (
        SELECT 1 FROM visited_locations
        WHERE user_id = $1 AND location_id = $2
      )
      RETURNING id, user_id, location_id, visited_at
    )
    SELECT id, user_id, location_id, visited_at
    FROM inserted
    UNION ALL
    SELECT id, user_id, location_id, visited_at
    FROM visited_locations
    WHERE user_id = $1
      AND location_id = $2
      AND NOT EXISTS (SELECT 1 FROM inserted)
    LIMIT 1
  `;
  const result = await pool.query(query, [userId, locationId]);
  return mapVisitRow(result.rows[0]);
}

async function findVisitedByUserId(userId) {
  const query = `
    SELECT *
    FROM (
      SELECT DISTINCT ON (l.id)
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
      ORDER BY l.id, vl.visited_at DESC
    ) visits
    ORDER BY visited_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows.map(mapVisitedLocationRow);
}

async function deleteVisit({ userId, locationId }) {
  const query = `
    DELETE FROM visited_locations
    WHERE user_id = $1 AND location_id = $2
    RETURNING id, user_id, location_id, visited_at
  `;
  const result = await pool.query(query, [userId, locationId]);
  return result.rows[0] ? mapVisitRow(result.rows[0]) : null;
}

async function getVisitProgress(userId) {
  const query = `
    SELECT COUNT(DISTINCT location_id)::int AS total_visited
    FROM visited_locations
    WHERE user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  const totalVisited = result.rows[0]?.total_visited || 0;
  const thresholds = [5, 10, 25];
  const nextMilestone = thresholds.find((threshold) => threshold > totalVisited) || null;

  return {
    totalVisited,
    nextMilestone,
    milestones: thresholds.map((threshold) => ({
      threshold,
      achieved: totalVisited >= threshold,
      remaining: Math.max(threshold - totalVisited, 0)
    }))
  };
}

function mapVisitRow(row) {
  return {
    id: Number(row.id),
    user_id: Number(row.user_id),
    location_id: Number(row.location_id),
    visited_at: row.visited_at
  };
}

function mapVisitedLocationRow(row) {
  return {
    id: Number(row.id),
    visited_at: row.visited_at,
    location_id: Number(row.location_id),
    title: row.title,
    city: row.city,
    address: row.address,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    category_name: row.category_name
  };
}

module.exports = { createVisit, deleteVisit, findVisitedByUserId, getVisitProgress };
