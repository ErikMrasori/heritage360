require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { pool } = require("../src/config/db");

async function runFile(client, filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  await client.query(sql);
}

async function main() {
  const client = await pool.connect();

  try {
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    const seedPath = path.join(__dirname, "../database/seed.sql");

    await runFile(client, schemaPath);
    await runFile(client, seedPath);

    console.log("Database schema and seed data applied successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Failed to apply schema/seed:", error.message);
  process.exit(1);
});
