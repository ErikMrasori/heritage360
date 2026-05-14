require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");

async function main() {
  const csvPath = path.join(__dirname, "..", "..", "database", "locations_seed.csv");
  const raw = fs.readFileSync(csvPath, "utf8");

  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  lines.shift();

  const userResult = await pool.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
  if (!userResult.rows[0]) {
    throw new Error("No user found in users table. Seed an admin user first.");
  }
  const createdBy = userResult.rows[0].id;

  for (const line of lines) {
    const [title, descriptionEn, descriptionSq, city, address, latitude, longitude, category] = line.split(",");

    const categoryResult = await pool.query("SELECT id FROM categories WHERE name = $1", [category]);
    if (!categoryResult.rows[0]) {
      console.warn(`Skipped ${title}: category '${category}' not found`);
      continue;
    }

    await pool.query(
      `INSERT INTO locations
         (title, description, description_sq, city, address, latitude, longitude, category_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        title,
        descriptionEn,
        descriptionSq,
        city,
        address,
        Number(latitude),
        Number(longitude),
        categoryResult.rows[0].id,
        createdBy
      ]
    );

    console.log(`Imported: ${title}`);
  }
}

main()
  .catch((error) => {
    console.error("Import failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
