const { Client } = require('pg');
const fs = require('fs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const client = new Client({
  host: 'aws-1-ap-southeast-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.frytggfrbzjhxyaqngum',
  password: 'Whpet@2026db!',
  connectionTimeoutMillis: 30000,
});

async function run() {
  await client.connect();
  
  const files = [
    'supabase/migrations/004_indexes.sql',
    'supabase/migrations/006_hardened_fixes.sql',
    'supabase/migrations/007_rls_hardened.sql',
    'supabase/migrations/009_rls.sql',
  ];
  
  for (const file of files) {
    const name = file.split('/').pop();
    const sql = fs.readFileSync(file, 'utf8');
    try {
      await client.query(sql);
      console.log('OK:', name);
    } catch(e) {
      console.error('FAIL:', name, '-', e.code, ':', e.message.substring(0, 400));
    }
  }
  
  await client.end();
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
