"use strict";

const { Client } = require("pg");
const { repairCatalog } = require("./qa-product-schema.cjs");

async function run() {
  const args = process.argv.slice(2);
  const dryRun = args.length === 0 || (args.length === 1 && args[0] === "--check");
  if (!dryRun && (args.length !== 1 || args[0] !== "--apply")) {
    throw new Error("Use --check or --apply");
  }

  const uri = process.env.DATABASE_URI;
  const expectedHost = process.env.CATALOG_TARGET_HOST;
  const expectedDatabase = process.env.CATALOG_TARGET_DATABASE;
  if (!uri || !expectedHost || !expectedDatabase) {
    throw new Error("DATABASE_URI, CATALOG_TARGET_HOST and CATALOG_TARGET_DATABASE are required");
  }
  if (!dryRun && process.env.IS_LIVE_STORE !== "false") {
    throw new Error("IS_LIVE_STORE must be false for apply");
  }

  let target;
  try {
    target = new URL(uri);
  } catch {
    throw new Error("Invalid database connection configuration");
  }
  if (!["postgres:", "postgresql:"].includes(target.protocol) ||
      target.hostname !== expectedHost ||
      target.pathname !== "/" + encodeURIComponent(expectedDatabase) ||
      target.search || target.hash) {
    throw new Error("Database connection does not match the designated target");
  }

  const client = new Client({
    connectionString: uri,
    ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: true },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    const { rows } = await client.query("SELECT current_database() AS name");
    if (rows[0]?.name !== expectedDatabase) throw new Error("Database identity mismatch");
    console.log(dryRun ? "Catalog preflight (transaction rolls back)" : "Catalog migration");
    await repairCatalog(client, console.log, { dryRun, seedQaInventory: false });
  } catch (error) {
    const code = /^[A-Z0-9]{5}$/.test(error.code || "") ? error.code : "unknown";
    const conflict = error.message === "Catalog identity conflict";
    throw new Error(conflict ? "Catalog identity conflict; transaction rolled back" : `Catalog migration failed (code ${code})`);
  } finally {
    await client.end().catch(() => {});
  }
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
