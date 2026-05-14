const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const { pool } = require("../config/db");

const OUTPUT = path.join(__dirname, "..", "..", "database", "locations_media.json");

async function main() {
  const { rows } = await pool.query(`
    SELECT l.title AS location_title, lm.media_type, lm.media_url, lm.caption
    FROM location_media lm
    JOIN locations l ON l.id = lm.location_id
    ORDER BY l.title, lm.id
  `);

  fs.writeFileSync(OUTPUT, JSON.stringify(rows, null, 2) + "\n", "utf8");
  console.log(`Wrote ${rows.length} media entries to ${path.relative(process.cwd(), OUTPUT)}`);
  console.log("Commit this JSON file together with anything new under uploads/.");
}

main()
  .catch((error) => {
    console.error("Media export failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
