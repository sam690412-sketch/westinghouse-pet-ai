-- ============================================================
-- 001_extensions.sql
-- Westinghouse Pet Taiwan — Safe Extensions Only
-- ============================================================

-- pg_trgm: fuzzy text search (MVP search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Required for gen_random_uuid() — built into PostgreSQL 13+, no extension needed
-- But uuid-ossp is sometimes useful for uuid_generate_v4()
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- NOT enabling:
-- - pgmq (NOT in Supabase extensions list)
-- - pg_net (HTTP from SQL is risky; use Edge Functions instead)
-- - zhparser (Chinese parser NOT available on Supabase)

COMMENT ON EXTENSION "pg_trgm" IS 'Trigram matching for fuzzy search MVP';
