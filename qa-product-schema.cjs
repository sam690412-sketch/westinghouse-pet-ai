"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");

const QA_SERVICE = "srv-dc0msn142hec73btfig0";
const QA_BRANCH = "v3-release-candidate";
const QA_DATABASE = "westinghouse_pet_v3_qa_db";
const QA_HOSTS = new Set(["dpg-dc0neg4s728c73aqa500-a", "dpg-dc0neg4s728c73aqa500"]);
const TABLES = ["product_contents", "commerce_products", "product_prices", "early_bird_reservations"];

const MARKET_PRODUCTS = [
  ["WH-M81-TW", "M81", "m81-fresh-food-feeder", 120, "in_stock"],
  ["WH-M12-TW", "M12", "m12-panoramic-feeder", 85, "in_stock"],
  ["WH-M31-TW", "M31", "m31-gashapon-feeder", 200, "in_stock"],
  ["WH-D11BA-TW", "D11-BA", "d11ba-water-dispenser", 0, "out_of_stock"],
  ["WH-D61-TW", "D61", "d61-stainless-dispenser", 45, "low_stock"],
];
const PRICE_MAPPING = MARKET_PRODUCTS.map(([sku, model]) => `('${sku}', '${model}')`).join(", ");
const MARKET_PRICE_JOIN = `
  LEFT JOIN (VALUES ${PRICE_MAPPING}) AS market(commerce_sku, price_sku)
    ON market.commerce_sku = cp.sku AND cp.currency = 'TWD'
  LEFT JOIN public.product_prices pp ON pp.sku = market.price_sku
`;

function readSQL(file) {
  return fs.readFileSync(path.join(__dirname, file), "utf8");
}

function section(sql, start, end) {
  const from = sql.indexOf(start);
  const to = sql.indexOf(end, from + start.length);
  if (from < 0 || to < 0) throw new Error("Unexpected source migration structure");
  return sql.slice(from, to);
}

async function tablePresence(client) {
  const result = await client.query(`
    SELECT name, EXISTS (
      SELECT 1 FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = name AND c.relkind IN ('r', 'p')
    ) AS present
    FROM unnest($1::text[]) AS targets(name)
  `, [TABLES]);
  return Object.fromEntries(result.rows.map(({ name, present }) => [name, present]));
}

async function repairCatalog(client, log = console.log) {
  await client.query("BEGIN");
  try {
    await client.query("SET LOCAL search_path = public, pg_catalog");
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '20s'");
    await client.query("SELECT pg_advisory_xact_lock(862021, 3001)");

    const before = await tablePresence(client);
    log("QA schema before", JSON.stringify(before));

    if (!before.product_contents) {
      await client.query(section(
        readSQL("supabase/migrations/003_core_tables.sql"),
        "CREATE TABLE IF NOT EXISTS public.product_contents (", "-- 3. orders"
      ));
      await client.query("ALTER TABLE public.product_contents ENABLE ROW LEVEL SECURITY");
    }

    if (!before.commerce_products) {
      await client.query(section(
        readSQL("migrations/001_create_commerce_products.sql"),
        "CREATE TABLE IF NOT EXISTS public.commerce_products (", "-- 3. RLS Policies"
      ));
      // Supabase-specific roles are absent from standalone Render PostgreSQL.
      await client.query(section(
        readSQL("migrations/001_create_commerce_products.sql"),
        "-- 4. Indexes", "-- 6. Seed data"
      ));
    }

    if (!before.early_bird_reservations) {
      await client.query(readSQL("migrations/20261121_early_bird_reservations.sql"));
      await client.query("ALTER TABLE public.early_bird_reservations ENABLE ROW LEVEL SECURITY");
    }

    const priceSeed = readSQL("migrations/20261121_approved_tw_prices.sql");
    await client.query(section(priceSeed, "CREATE TABLE IF NOT EXISTS product_prices (", "COMMIT;"));
    if (!before.product_prices) {
      await client.query("ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY");
    }

    const contentSeed = section(
      readSQL("supabase/migrations/008_seed.sql"),
      "INSERT INTO public.product_contents", "ON CONFLICT (slug) DO UPDATE"
    );
    await client.query(contentSeed + "ON CONFLICT DO NOTHING");

    for (const [sku, model, slug, stock, stockStatus] of MARKET_PRODUCTS) {
      const asset = model.toLowerCase();
      const cardImage = `/images/products/card/${asset}-card.webp`;
      const oldImage = `/images/products/${asset.replace("-", "")}-hero.jpg`;
      await client.query(`
        UPDATE public.product_contents SET hero_image_url = $2, updated_at = now()
        WHERE sku = $1 AND deleted_at IS NULL AND (hero_image_url IS NULL OR hero_image_url = $3)
      `, [sku, cardImage, oldImage]);

      await client.query(`
        INSERT INTO public.commerce_products
          (product_content_id, sku, price, compare_at_price, stock_quantity, stock_status)
        SELECT pc.id, pc.sku, pp.promo_twd, pp.msrp_twd, $4, $5
        FROM public.product_contents pc
        CROSS JOIN public.product_prices pp
        WHERE pc.sku = $1 AND pp.sku = $2 AND pc.slug = $3 AND pc.deleted_at IS NULL
        ON CONFLICT (sku) DO NOTHING
      `, [sku, model, slug, stock, stockStatus]);

      await client.query(`
        UPDATE public.commerce_products cp
          SET price = pp.promo_twd, compare_at_price = pp.msrp_twd
        FROM public.product_prices pp
        WHERE cp.sku = $1 AND pp.sku = $2 AND cp.currency = 'TWD' AND cp.is_active
          AND (cp.price, cp.compare_at_price) IS DISTINCT FROM (pp.promo_twd, pp.msrp_twd)
      `, [sku, model]);

      const result = await client.query(`
        SELECT cp.sku FROM public.commerce_products cp
        JOIN public.product_contents pc ON pc.id = cp.product_content_id AND pc.sku = cp.sku
        ${MARKET_PRICE_JOIN}
        WHERE cp.sku = $1 AND pc.slug = $2 AND pc.deleted_at IS NULL AND cp.is_active
          AND cp.price = pp.promo_twd AND cp.compare_at_price = pp.msrp_twd
      `, [sku, slug]);
      if (result.rowCount !== 1) throw new Error("QA catalog identity conflict");
    }
    const after = await tablePresence(client);
    if (!Object.values(after).every(Boolean)) throw new Error("QA schema incomplete");
    await client.query("COMMIT");
    log("QA schema after", JSON.stringify(after));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function prepareRenderQaCatalog() {
  if (process.env.RENDER_SERVICE_ID !== QA_SERVICE) return;
  if (process.env.RENDER_GIT_BRANCH !== QA_BRANCH || process.env.IS_LIVE_STORE === "true") {
    throw new Error("QA catalog requires the candidate branch with checkout disabled");
  }
  const signingKey = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SIGNING_KEY;
  if (!signingKey || signingKey.length < 32) throw new Error("QA admin signing key unavailable");
  const uri = process.env.DATABASE_URI;
  let target;
  try {
    target = new URL(uri);
  } catch {
    throw new Error("QA internal database connection unavailable");
  }

  const adminUri = process.env.DATABASE_URL || uri;
  if (!["postgres:", "postgresql:"].includes(target.protocol) ||
      !QA_HOSTS.has(target.hostname) || target.pathname !== "/" + QA_DATABASE ||
      (target.port && target.port !== "5432") || adminUri !== uri) {
    throw new Error("QA catalog requires the designated internal database");
  }

  const client = new Client({
    connectionString: uri,
    ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  try {
    await client.connect();
    const { rows } = await client.query("SELECT current_database() AS name");
    if (rows[0]?.name !== QA_DATABASE) throw new Error("QA database identity mismatch");
    await repairCatalog(client);
  } catch (error) {
    const code = /^[A-Z0-9]{5}$/.test(error.code || "") ? error.code : "unknown";
    throw new Error(`QA catalog initialization failed (code ${code})`);
  } finally {
    await client.end().catch(() => {});
  }
}

module.exports = { MARKET_PRICE_JOIN, prepareRenderQaCatalog, repairCatalog };
