# Phase 3.2 Architecture Review — Critical Audit

## Executive Summary

**Blockers (Must Fix Before Migration):**

| # | Issue | Severity |
|---|-------|----------|
| B-1 | `pgmq` extension likely NOT available on Supabase | **P0** |
| B-2 | `to_tsvector('chinese', ...)` — Chinese dictionary does not exist in default PostgreSQL/Supabase | **P0** |
| B-3 | `CREATE TRIGGER IF NOT EXISTS` — Invalid PostgreSQL syntax | **P0** |
| B-4 | `MAX(...) + 1` order number generation has race condition | **P0** |
| B-5 | Audit log RLS policy `FOR ALL USING(false)` blocks SELECT | **P0** |

**Total Issues Found: 23**
- P0: 5
- P1: 12
- P2: 6

---

## A. Architecture Findings Table

| Severity | Problem | Risk | Fix | Decision |
|----------|---------|------|-----|----------|
| **P0** | `pgmq` extension not in Supabase official extensions list | Async job queue fails to create | Custom queue table + Edge Function worker | Replace pgmq with custom queue |
| **P0** | `to_tsvector('chinese', ...)` — no `chinese` text search config in Supabase | Full-text search silently fails | Use `simple` + `pg_trgm` hybrid | Rewrite unified_search |
| **P0** | `CREATE TRIGGER IF NOT EXISTS` — PostgreSQL does not support `IF NOT EXISTS` for triggers | Migration fails | `DO $$ BEGIN CREATE TRIGGER ... EXCEPTION WHEN duplicate_object THEN null; END $$` | Rewrite trigger creation |
| **P0** | `generate_order_number()` uses `MAX(...) + 1` | Race condition: duplicate order numbers under concurrent checkout | Sequence-based generator with advisory lock | Rewrite with SEQUENCE |
| **P0** | Audit log `FOR ALL USING(false)` | Blocks SELECT on audit_log — admins cannot read audit data | Separate policies: SELECT allow, no UPDATE/DELETE policy | Fix RLS |
| **P1** | `pg_net` extension usage | HTTP from SQL is risky; Supabase Edge Functions are better | Remove pg_net; use Edge Functions for HTTP | Remove pg_net |
| **P1** | `product_sku` as TEXT without FK in reviews/warranties | Data integrity risk | reviews: add FK; warranties/orders: keep as snapshot with CHECK | Add FK where appropriate |
| **P1** | `order_items.subtotal` is derived but no CHECK constraint | Data inconsistency risk | Add CHECK (subtotal = quantity * unit_price) | Add constraint |
| **P1** | `md5(random())` for warranty code | Not cryptographically secure; collision possible | Use `encode(gen_random_bytes(4), 'hex')` | Rewrite |
| **P1** | `payload` schema vs `public` schema for CMS data | Direct write to public couples CMS to app schema | Payload writes to `payload` schema; sync to `public` via Edge Function | Separate schemas |
| **P1** | Missing soft delete for products/articles | Accidental deletion causes broken URLs | Add `deleted_at` timestamp + filtered views | Add soft delete |
| **P1** | Missing `ON DELETE` strategy on several FKs | Orphan records or unexpected cascades | Explicit ON DELETE for each FK | Add strategies |
| **P1** | `reviews.images` as TEXT[] | Array search is slow; no validation | Keep but add GIN index | Add index |
| **P1** | `changes` JSONB in audit_log has no schema validation | Malformed audit data | Add CHECK constraint for expected structure | Add validation |
| **P2** | No connection pooling config mentioned | Connection exhaustion under load | Document pgbouncer settings | Document |
| **P2** | `warranty_code` 8 chars may not be enough | With growth, collision risk increases | Increase to 12 chars or use UUID | Increase length |
| **P2** | `product_contents.solutions` as TEXT[] | No referential integrity to solutions table | Keep as loose coupling (acceptable) | Accept |
| **P2** | `subscription_orders` lacks cancellation reason | Analytics blind spot | Add `cancellation_reason` TEXT | Add field |
| **P2** | `cart_items` has no expiration | Abandoned carts accumulate | Add `expires_at` TIMESTAMPTZ | Add field |
| **P2** | `tickets.notes` JSONB structure undefined | Schema drift risk | Document expected structure in code | Document |
| **P2** | `pg_cron` not enabled for queue worker | Requires manual trigger or external scheduler | Use Supabase Edge Functions with cron | Edge Functions |
| **P2** | `generate_ticket_number()` same MAX+1 pattern | Same race condition as order numbers | Apply same SEQUENCE fix | Fix |

---

## B. Hardened Decisions

### Decision 1: Custom Queue Table (Replace pgmq)

**Why**: pgmq is not in Supabase's supported extensions list. Cannot guarantee availability.

**Tradeoff**: pgmq is more feature-rich (visibility timeout, dead letter queue). Custom queue is simpler but requires manual implementation.

**Final Decision**: Custom `job_queue` table + Supabase Edge Function worker polled via pg_cron. Queue table has: id, queue_name, payload, attempts, max_attempts, available_at, reserved_at, created_at.

### Decision 2: `simple` + `pg_trgm` Search (Replace chinese FTS)

**Why**: `chinese` text search dictionary does not exist in Supabase PostgreSQL. Using it causes `ERROR: text search configuration "chinese" does not exist`.

**Tradeoff**: `simple` does not segment Chinese words (treats each character separately). `pg_trgm` provides fuzzy matching but is slower than dedicated search engine.

**Final Decision**: MVP uses `to_tsvector('simple', ...)` + `pg_trgm` similarity. Scale-up path: Algolia.

### Decision 3: SEQUENCE-Based Order Number (Replace MAX+1)

**Why**: `MAX(...) + 1` is not atomic. Two concurrent transactions can read the same MAX and produce the same number.

**Tradeoff**: SEQUENCE requires additional objects but guarantees uniqueness.

**Final Decision**: Create dedicated SEQUENCE per day prefix, or use a counter table with advisory lock. Use `SEQUENCE` for simplicity.

### Decision 4: Separate CMS Schema (Payload writes to `payload`, not `public`)

**Why**: Direct Payload write to `public` creates tight coupling. Schema changes in Payload affect production app tables.

**Tradeoff**: Requires sync mechanism (Edge Function) from `payload` to `public`.

**Final Decision**: Payload uses schema `payload`. Sync to `public.product_contents` via Edge Function on publish.

---

## C. Revised ERD Changes

Changes from v1:
1. Added `job_queue` table (replaces pgmq)
2. Added `product_contents.deleted_at` (soft delete)
3. Changed `reviews.product_sku` → `reviews.product_id UUID FK` (referential integrity)
4. Added `order_items` CHECK constraint
5. Changed order/ticket number generation to SEQUENCE-based
6. Fixed audit_log RLS (SELECT allowed, UPDATE/DELETE blocked)
7. Added `cart_items.expires_at`
8. Changed `pgmq_*` tables → removed (use `job_queue`)

---

## D. Revised SQL Migration Strategy

| File | Content |
|------|---------|
| `001_extensions.sql` | Enable safe extensions only |
| `002_enums.sql` | All custom ENUM types |
| `003_core_tables.sql` | All tables with constraints |
| `004_indexes.sql` | All indexes (including search) |
| `005_functions.sql` | Number generators, search, triggers |
| `006_queue.sql` | Custom job queue table |
| `007_audit.sql` | Audit log with immutability |
| `008_seed.sql` | Initial product data |
| `009_rls.sql` | Row Level Security policies |

---

*Review complete. Revised DDL follows.*
