const { pool } = require("../config/db");

async function findByEmail(email) {
  const query = `
    SELECT u.id, u.full_name, u.email, u.password_hash, u.created_at, r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}

async function findById(id) {
  const query = `
    SELECT u.id, u.full_name, u.email, u.created_at, r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function createUser({ fullName, email, passwordHash, roleId }) {
  const query = `
    INSERT INTO users (full_name, email, password_hash, role_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, full_name, email, created_at
  `;
  const result = await pool.query(query, [fullName, email, passwordHash, roleId]);
  return result.rows[0];
}

module.exports = { findByEmail, findById, createUser };
