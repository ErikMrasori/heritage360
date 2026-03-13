const { pool } = require("../config/db");

async function findAll() {
  const result = await pool.query("SELECT id, name FROM categories ORDER BY name ASC");
  return result.rows;
}

module.exports = { findAll };
