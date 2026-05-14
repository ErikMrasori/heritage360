require("dotenv").config();

const app = require("./src/app");
const { env } = require("./src/config/env");
const { ensureSchemaCompatibility } = require("./src/config/db");

async function start() {
  await ensureSchemaCompatibility();
  app.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend.", error);
  process.exit(1);
});
