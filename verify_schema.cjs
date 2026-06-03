const { Client } = require('pg');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const client = new Client({
  host: 'aws-1-ap-southeast-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.frytggfrbzjhxyaqngum',
  password: 'Whpet@2026db!',
  connectionTimeoutMillis: 15000,
});

async function verify() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL 17.6\n');

  // 1. Tables
  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log('=== TABLES (' + tables.rows.length + ') ===');
  tables.rows.forEach(r => console.log('  ' + r.table_name));

  // 2. ENUMs
  const enums = await client.query(
    "SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname"
  );
  console.log('\n=== ENUM TYPES (' + enums.rows.length + ') ===');
  enums.rows.forEach(r => console.log('  ' + r.typname));

  // 3. Indexes
  const idx = await client.query(
    "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname"
  );
  console.log('\n=== INDEXES (' + idx.rows.length + ') ===');
  idx.rows.forEach(r => console.log('  ' + r.indexname));

  // 4. Functions
  const funcs = await client.query(
    "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name"
  );
  console.log('\n=== FUNCTIONS (' + funcs.rows.length + ') ===');
  funcs.rows.forEach(r => console.log('  ' + r.routine_name));

  // 5. Triggers
  const triggers = await client.query(
    "SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public' ORDER BY trigger_name"
  );
  console.log('\n=== TRIGGERS (' + triggers.rows.length + ') ===');
  triggers.rows.forEach(r => console.log('  ' + r.trigger_name + ' ON ' + r.event_object_table));

  // 6. RLS enabled tables
  const rls = await client.query(
    "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true ORDER BY tablename"
  );
  console.log('\n=== RLS ENABLED TABLES (' + rls.rows.length + ') ===');
  rls.rows.forEach(r => console.log('  ' + r.tablename));

  // 7. RLS Policies
  const policies = await client.query(
    "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname"
  );
  console.log('\n=== RLS POLICIES (' + policies.rows.length + ') ===');
  policies.rows.forEach(r => console.log('  ' + r.tablename + ': ' + r.policyname));

  // 8. Extensions
  const ext = await client.query(
    "SELECT extname FROM pg_extension ORDER BY extname"
  );
  console.log('\n=== EXTENSIONS (' + ext.rows.length + ') ===');
  ext.rows.forEach(r => console.log('  ' + r.extname));

  // 9. Seed data
  const products = await client.query(
    "SELECT slug, sku, name FROM product_contents ORDER BY slug"
  );
  console.log('\n=== SEED PRODUCTS (' + products.rows.length + ') ===');
  products.rows.forEach(r => console.log('  ' + r.slug + ' | ' + r.sku + ' | ' + r.name));

  await client.end();
}

verify().catch(e => { console.error('FATAL:', e); process.exit(1); });
