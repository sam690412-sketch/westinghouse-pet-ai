/**
 * Execute migration on LIVE Supabase
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const DATABASE_URI = process.env.DATABASE_URI ||
  "postgresql://postgres.frytggfrbzjhxyaqngum:Whpet@2026db!@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

const MIGRATION_FILE = process.argv[2] || path.join(__dirname, "001_create_commerce_products.sql");

async function main() {
  const sql = fs.readFileSync(MIGRATION_FILE, "utf-8");

  const client = new Client({
    connectionString: DATABASE_URI,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL");

    await client.query(sql);
    console.log("Migration executed successfully");

    // Verify
    const count = await client.query("SELECT COUNT(*) FROM commerce_products");
    console.log(`commerce_products: ${count.rows[0].count} rows seeded`);

    const rows = await client.query(
      `SELECT sku, price, compare_at_price, stock_status, stock_quantity FROM commerce_products ORDER BY sku`
    );
    console.log("\nSeeded data:");
    rows.rows.forEach((r) => {
      const discount = r.compare_at_price
        ? Math.round((1 - r.price / r.compare_at_price) * 100)
        : 0;
      console.log(`  ${r.sku}: NT$${r.price} (compare NT$${r.compare_at_price}, ${discount}% off) — ${r.stock_status} (${r.stock_quantity} qty)`);
    });

    // Verify JOIN
    console.log("\n--- JOIN test ---");
    const join = await client.query(`
      SELECT
        pc.slug,
        pc.name,
        cp.sku,
        cp.price,
        cp.compare_at_price,
        cp.stock_status,
        cp.stock_quantity
      FROM product_contents pc
      INNER JOIN commerce_products cp ON pc.id = cp.product_content_id
      WHERE pc.deleted_at IS NULL AND cp.is_active = true
      ORDER BY cp.price DESC
    `);
    join.rows.forEach((r) => {
      console.log(`  ${r.name}: NT$${r.price} / ${r.stock_status}`);
    });

    console.log("\nMigration COMPLETE");
  } catch (err) {
    console.error("Migration FAILED:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
