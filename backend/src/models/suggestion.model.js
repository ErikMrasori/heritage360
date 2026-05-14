const { pool } = require("../config/db");

async function createSuggestion(payload) {
  const query = `
    INSERT INTO landmark_suggestions (
      full_name, email, landmark_name, city, category_id, message
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, full_name, email, landmark_name, city, category_id, message, created_at
  `;

  const result = await pool.query(query, [
    payload.fullName,
    payload.email,
    payload.landmarkName,
    payload.city,
    payload.categoryId || null,
    payload.message
  ]);

  return mapSuggestionRow(result.rows[0]);
}

function mapSuggestionRow(row) {
  return {
    id: Number(row.id),
    fullName: row.full_name,
    email: row.email,
    landmarkName: row.landmark_name,
    city: row.city,
    categoryId: row.category_id ? Number(row.category_id) : null,
    message: row.message,
    createdAt: row.created_at
  };
}

module.exports = { createSuggestion };
