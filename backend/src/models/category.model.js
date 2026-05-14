const { pool } = require("../config/db");

function mapCategoryRow(row) {
  return row ? { id: Number(row.id), name: row.name } : null;
}

async function findAll() {
  const result = await pool.query("SELECT id, name FROM categories ORDER BY name ASC");
  return result.rows.map(mapCategoryRow);
}

async function findById(id) {
  const result = await pool.query("SELECT id, name FROM categories WHERE id = $1", [id]);
  return mapCategoryRow(result.rows[0]) || null;
}

async function create(name) {
  const result = await pool.query(
    "INSERT INTO categories (name) VALUES ($1) RETURNING id, name",
    [name]
  );
  return mapCategoryRow(result.rows[0]);
}

async function update(id, name) {
  const result = await pool.query(
    "UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name",
    [name, id]
  );
  return mapCategoryRow(result.rows[0]);
}

async function remove(id) {
  await pool.query("DELETE FROM categories WHERE id = $1", [id]);
}

module.exports = { findAll, findById, create, update, remove };
