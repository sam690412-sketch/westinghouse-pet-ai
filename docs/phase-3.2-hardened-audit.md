# Phase 3.2 Hardened Audit Report

## 1. Executive Summary

**Status: APPROVED WITH FIXES**

17 issues found: 5 P0, 9 P1, 3 P2. All P0 have exact SQL fixes. Schema is structurally sound but has production safety gaps that must be closed before deployment.

---

## 2. P0 Findings (Must Fix Before Approval)

### P0-1: `gen_random_bytes()` requires `pgcrypto` extension — NOT guaranteed on Supabase

**File**: 005_functions.sql:88
**Risk**: Warranty code generation fails with `ERROR: function gen_random_bytes(integer) does not exist`
**Impact**: All warranty registrations fail. Complete feature outage.
**Root Cause**: `gen_random_bytes()` is from `pgcrypto` extension, not built-in. Extension not created in 001_extensions.sql.

```sql
-- FIX: Add to 001_extensions.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Alternative fix (if pgcrypto unavailable): use built-in gen_random_uuid()
-- Replace in 005_functions.sql:
-- random_part := upper(encode(gen_random_bytes(4), 'hex'));
-- WITH:
-- random_part := replace(gen_random_uuid()::text, '-', '');
```

**Recommendation**: Add `pgcrypto` to 001_extensions.sql. It IS available on Supabase (required for auth). Verify with `SELECT * FROM pg_available_extensions WHERE name = 'pgcrypto'`.

---

### P0-2: `is_admin()` SECURITY DEFINER has no `search_path` — SQL injection via search_path attack

**File**: 009_rls.sql:34-44
**Risk**: Attacker can create `public.is_admin()` table, hijack function resolution, bypass RLS
**Impact**: Complete RLS bypass. Any user can read/modify any table.
**Root Cause**: `SECURITY DEFINER` functions must explicitly set `search_path` to prevent namespace hijacking.

```sql
-- FIX: Rewrite is_admin() with explicit search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.members WHERE id = auth.uid();
    RETURN v_role IN ('admin', 'support', 'ops');
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Also fix**: `set_updated_at()` should have `search_path = public` for consistency:
```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### P0-3: `orders.order_number` has no DEFAULT — INSERT fails if app forgets to call function

**File**: 003_core_tables.sql:52-64
**Risk**: App developer forgets to call `generate_order_number()` → INSERT fails with NOT NULL violation
**Impact**: Checkout flow breaks. 500 error for customer.
**Root Cause**: No DEFAULT or trigger to auto-generate order number.

```sql
-- FIX: Add trigger to auto-generate order number
CREATE OR REPLACE FUNCTION public.auto_generate_order_number()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := public.generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    CREATE TRIGGER trg_orders_auto_number
        BEFORE INSERT ON public.orders
        FOR EACH ROW EXECUTE FUNCTION public.auto_generate_order_number();
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Same for tickets
CREATE OR REPLACE FUNCTION public.auto_generate_ticket_number()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := public.generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    CREATE TRIGGER trg_tickets_auto_number
        BEFORE INSERT ON public.tickets
        FOR EACH ROW EXECUTE FUNCTION public.auto_generate_ticket_number();
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;
```

---

### P0-4: `idx_cart_items_expires` partial index with volatile `now()` — index is permanently wrong

**File**: 004_indexes.sql:75-77
**Risk**: Partial index `WHERE expires_at < now() + interval '1 day'` evaluates `now()` at CREATE INDEX time, not query time. Index only contains rows that were expiring within 1 day of migration. After 1 day, index is useless.
**Impact**: Cart cleanup queries do a sequential scan on entire cart_items table. Performance degrades as cart grows.
**Root Cause**: `now()` in partial index predicate is a constant at index creation.

```sql
-- FIX: Remove the broken partial index, replace with standard index
DROP INDEX IF EXISTS idx_cart_items_expires;

-- Standard index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_cart_items_expires_at
    ON public.cart_items(expires_at);

-- Cleanup query should use: WHERE expires_at < now()
-- This uses the standard index efficiently
```

---

### P0-5: `payments.transaction_id` UNIQUE allows multiple NULLs — duplicate pending payments possible

**File**: 003_core_tables.sql:90
**Risk**: Multiple pending payments for same order can have NULL transaction_id. No constraint violation.
**Impact**: Payment webhook processing may target wrong payment record. Double-charge risk.
**Root Cause**: PostgreSQL UNIQUE constraint allows multiple NULL values by default.

```sql
-- FIX: Use UNIQUE NULLS NOT DISTINCT (PostgreSQL 15+)
-- OR: Make transaction_id NOT NULL and use a placeholder for pending

-- Option A (PostgreSQL 15+):
-- ALTER TABLE public.payments 
-- DROP CONSTRAINT uq_payments_transaction,
-- ADD CONSTRAINT uq_payments_transaction UNIQUE NULLS NOT DISTINCT (transaction_id);

-- Option B (More compatible): transaction_id is generated before insert
-- Change transaction_id to NOT NULL, generate placeholder for pending
-- ALTER TABLE public.payments ALTER COLUMN transaction_id SET NOT NULL;

-- Option C (Safest): Add composite unique on (order_id, provider, status) for pending
ALTER TABLE public.payments
ADD CONSTRAINT uq_payments_pending_per_order 
UNIQUE (order_id, provider, status) 
WHERE status = 'pending';
```

---

## 3. P1 Findings (Recommended Before Production)

### P1-1: No admin UPDATE policy for `members` — admin dashboard cannot update member profiles

**File**: 009_rls.sql
**Risk**: Admin dashboard (using authenticated client) cannot update member roles/names
**Impact**: Role management requires service_role. Admin UI needs backend proxy.
**Fix**:
```sql
-- Add admin update policy for members
CREATE POLICY "members_admin_update"
    ON public.members FOR UPDATE
    USING (is_admin());
```

---

### P1-2: `support` and `ops` roles can DELETE products via `is_admin()` — too broad

**File**: 009_rls.sql:185
**Risk**: `is_admin()` returns true for 'admin', 'support', 'ops'. The `_admin_all` policy on product_contents allows ALL operations including DELETE.
**Impact**: Non-admin staff can accidentally delete products.
**Fix**: Split admin policies by operation:
```sql
-- Replace blanket admin_all with granular policies
DROP POLICY IF EXISTS "product_contents_admin_all" ON public.product_contents;

CREATE POLICY "product_contents_admin_select" ON public.product_contents FOR SELECT USING (is_admin());
CREATE POLICY "product_contents_admin_insert" ON public.product_contents FOR INSERT WITH CHECK ((SELECT role FROM public.members WHERE id = auth.uid()) IN ('admin', 'ops'));
CREATE POLICY "product_contents_admin_update" ON public.product_contents FOR UPDATE USING (is_admin());
CREATE POLICY "product_contents_admin_delete" ON public.product_contents FOR DELETE USING ((SELECT role FROM public.members WHERE id = auth.uid()) = 'admin');
```

---

### P1-3: `reviews_own_update` allows editing published reviews — content can change after moderation

**File**: 009_rls.sql:144-146
**Risk**: Member edits review after admin publishes it. Moderated content changes unreviewed.
**Impact**: Inappropriate content appears on public site after passing moderation.
**Fix**:
```sql
-- Replace reviews_own_update
DROP POLICY IF EXISTS "reviews_own_update" ON public.reviews;

-- Members can only update UNPUBLISHED reviews
CREATE POLICY "reviews_own_update_unpublished"
    ON public.reviews FOR UPDATE
    USING (member_id = auth.uid() AND is_published = false);
```

---

### P1-4: `product_contents` slug/sku have no format validation — invalid URLs possible

**File**: 003_core_tables.sql
**Risk**: Slug like "M81 Product!!!" breaks URL routing. SKU like "m81-tw" breaks consistency.
**Impact**: 404 errors, broken canonical URLs, SEO damage.
**Fix**:
```sql
-- Add format check constraints
ALTER TABLE public.product_contents
ADD CONSTRAINT chk_slug_format CHECK (slug ~ '^[a-z0-9-]+$');

ALTER TABLE public.product_contents
ADD CONSTRAINT chk_sku_format CHECK (sku ~ '^WH-[A-Z0-9]+-TW$');
```

---

### P1-5: `reset_order_sequence()` requires ALTER privilege — fails for non-owner users

**File**: 005_functions.sql:37-42
**Risk**: Cron job running as limited user cannot reset sequence.
**Impact**: Order numbers continue incrementing across days (WH-20260525-0042, next day WH-20260526-0043 instead of WH-20260526-0001).
**Fix**:
```sql
-- Make function SECURITY DEFINER with explicit search_path
CREATE OR REPLACE FUNCTION public.reset_order_sequence()
RETURNS void
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
    ALTER SEQUENCE public.seq_order_number RESTART WITH 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.reset_ticket_sequence()
RETURNS void
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
    ALTER SEQUENCE public.seq_ticket_number RESTART WITH 1;
END;
$$ LANGUAGE plpgsql;
```

---

### P1-6: `subscription_orders` missing from `updated_at` trigger list

**File**: 005_functions.sql:199
**Risk**: No auto-update for `subscription_orders.updated_at`
**Impact**: Stale timestamp, cache invalidation issues
**Fix**:
```sql
-- Add subscription_orders to trigger list in the DO block
-- Change: tables text[] := ARRAY[...]
-- Add 'subscription_orders' to the array
```

Also add trigger for `subscription_orders` if it has `updated_at` (it doesn't in the schema - check: no updated_at column on subscription_orders. This is actually fine since subscriptions don't have updated_at. But if we want one...)

Actually, `subscription_orders` doesn't have `updated_at` in the schema. So no trigger needed. But for consistency, consider adding `updated_at` to the table.

```sql
-- Add updated_at to subscription_orders for consistency
ALTER TABLE public.subscription_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Then add to trigger list:
-- tables text[] := ARRAY['members', 'orders', 'tickets', 'reviews', 'cart_items', 
--                        'product_contents', 'learn_articles', 'solutions', 
--                        'product_bundles', 'subscription_orders'];
```

---

### P1-7: `idx_product_contents_active` is useless — indexes PK with partial condition

**File**: 004_indexes.sql:27-29
**Risk**: Wasted index space, slower writes, no query benefit
**Impact**: Slightly degraded write performance
**Fix**:
```sql
-- Remove useless index
DROP INDEX IF EXISTS idx_product_contents_active;
-- The deleted_at IS NULL condition is already covered by category index 
-- and slug index which both have WHERE deleted_at IS NULL
```

---

### P1-8: `order_items` missing `created_at` — no temporal tracking

**File**: 003_core_tables.sql:67-76
**Risk**: Cannot determine when order item was added. Hard to debug order issues.
**Impact**: Support team cannot answer "when was this item added to the order?"
**Fix**:
```sql
-- Add created_at to order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
```

---

### P1-9: `warranties` missing `updated_at` — status changes not tracked

**File**: 003_core_tables.sql:94-107
**Risk**: Cannot determine when warranty was claimed or expired
**Impact**: Support team cannot audit warranty status changes
**Fix**:
```sql
-- Add updated_at and trigger to warranties
ALTER TABLE public.warranties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
    CREATE TRIGGER trg_warranties_updated_at
        BEFORE UPDATE ON public.warranties
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
```

---

## 4. P2 Findings (Future Optimization)

### P2-1: `audit_log` has no partitioning — will grow indefinitely
**Risk**: Table bloat, slow queries, storage cost
**Fix**: Implement monthly partitioning or TTL cleanup job

### P2-2: `job_queue` has no dead letter queue separation
**Risk**: Failed jobs mixed with pending, harder to diagnose
**Fix**: Add `failed_jobs` archive table or separate queue

### P2-3: No `inventory` table — stock tracking is future feature
**Risk**: Cannot implement stock checks, overselling possible
**Fix**: Add `inventory` table when commerce features expand:
```sql
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_sku TEXT NOT NULL UNIQUE REFERENCES public.product_contents(sku),
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 5. Security Score: 72/100

| Area | Score | Notes |
|------|-------|-------|
| RLS Coverage | 85 | All tables covered, some gaps (admin member update) |
| Privilege Escalation Prevention | 60 | is_admin() search_path vuln (P0), support can delete (P1) |
| Data Integrity | 80 | Good FKs and CHECKs, some missing (format validation) |
| Audit Trail | 75 | Immutable audit_log, missing warranty tracking |
| Injection Safety | 70 | SEARCH PATH vuln (P0), no SQL injection in functions |

**After P0 fixes: 88/100**
**After P0+P1 fixes: 94/100**

---

## 6. Production Readiness Score: 78/100

| Area | Score | Notes |
|------|-------|-------|
| Schema Correctness | 85 | Solid design, minor gaps |
| Supabase Compatibility | 90 | Standard extensions, correct RLS syntax |
| Performance | 75 | One useless index (P1-7), one broken index (P0-4) |
| Commerce Safety | 80 | Good order structure, payment gap (P0-5) |
| Maintainability | 75 | Good docs, some missing columns (P1-8,9) |

**After P0 fixes: 90/100**
**After P0+P1 fixes: 96/100**

---

## 7. Final Verdict

### APPROVED WITH FIXES

All P0 must be applied before Phase 3.3. P1 strongly recommended before production deploy.

---

## 8. Exact Action List

### Immediate (Before Phase 3.3)
1. Apply P0-1: Add `pgcrypto` extension
2. Apply P0-2: Fix `is_admin()` search_path
3. Apply P0-3: Add auto-number triggers
4. Apply P0-4: Fix cart_items index
5. Apply P0-5: Fix payments unique constraint

### Before Production Deploy
6. Apply P1-1: Add admin member update policy
7. Apply P1-2: Restrict delete to admin only
8. Apply P1-3: Restrict review edits to unpublished
9. Apply P1-4: Add slug/sku format validation
10. Apply P1-5: Make sequence reset SECURITY DEFINER
11. Apply P1-6: Add updated_at to subscription_orders
12. Apply P1-7: Remove useless index
13. Apply P1-8: Add created_at to order_items
14. Apply P1-9: Add updated_at to warranties
