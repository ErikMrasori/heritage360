const { pool } = require("../config/db");

async function findByName(name) {
  const result = await pool.query("SELECT id, name FROM roles WHERE name = $1", [name]);
  return result.rows[0] || null;
}

module.exports = { findByName };
