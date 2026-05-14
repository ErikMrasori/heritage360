const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const { pool } = require("../config/db");

const INPUT = path.join(__dirname, "..", "..", "database", "locations_media.json");

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.log("No locations_media.json found — nothing to import.");
    return;
  }

  const entries = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  let inserted = 0;
  let skipped = 0;
  let missing = 0;

  for (const entry of entries) {
    const { location_title: title, media_type: type, media_url: url, caption } = entry;

    const loc = await pool.query("SELECT id FROM locations WHERE title = $1 LIMIT 1", [title]);
    if (!loc.rows[0]) {
      console.warn(`Skipped (no location named "${title}")`);
      missing += 1;
      continue;
    }

    const existing = await pool.query(
      "SELECT 1 FROM location_media WHERE location_id = $1 AND media_url = $2 LIMIT 1",
      [loc.rows[0].id, url]
    );
    if (existing.rows[0]) {
      skipped += 1;
      continue;
    }

    await pool.query(
      "INSERT INTO location_media (location_id, media_type, media_url, caption) VALUES ($1, $2, $3, $4)",
      [loc.rows[0].id, type, url, caption || null]
    );
    inserted += 1;
  }

  console.log(`Imported ${inserted} new media rows. Skipped ${skipped} duplicates. Missing locations: ${missing}.`);
}

main()
  .catch((error) => {
    console.error("Media import failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
