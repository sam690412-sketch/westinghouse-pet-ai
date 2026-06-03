-- ============================================================
-- 006_hardened_fixes.sql
-- Phase 3.2 Hardened Audit — P0 Fixes (MUST APPLY)
-- 
-- Fixes:
-- P0-1: pgcrypto extension for gen_random_bytes()
-- P0-2: is_admin() search_path security
-- P0-3: Auto-generate order/ticket numbers
-- P0-4: Fix broken cart_items partial index
-- P0-5: Fix payments NULL unique constraint
-- ============================================================

-- -----------------------------------------------------------
-- P0-1: Enable pgcrypto (required for gen_random_bytes)
-- -----------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
COMMENT ON EXTENSION "pgcrypto" IS 'Required for gen_random_bytes() in warranty code generation';

-- -----------------------------------------------------------
-- P0-2: Fix is_admin() — add explicit search_path (SECURITY DEFINER safety)
-- -----------------------------------------------------------
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

-- Also fix set_updated_at for consistency
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------
-- P0-3: Auto-generate order/ticket numbers on INSERT
-- -----------------------------------------------------------

-- Order number auto-generation
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

-- Ticket number auto-generation
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

-- -----------------------------------------------------------
-- P0-4: Fix broken cart_items partial index (volatile now() in predicate)
-- -----------------------------------------------------------
DROP INDEX IF EXISTS idx_cart_items_expires;

-- Replace with standard index on expires_at
CREATE INDEX IF NOT EXISTS idx_cart_items_expires_at
    ON public.cart_items(expires_at);

-- -----------------------------------------------------------
-- P0-5: Fix payments — prevent multiple pending payments per order
-- -----------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_pending_per_order 
ON public.payments (order_id, provider, status) 
WHERE status = 'pending';

-- -----------------------------------------------------------
-- BONUS: Add created_at to order_items (P1-8)
-- -----------------------------------------------------------
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- -----------------------------------------------------------
-- BONUS: Add updated_at to warranties (P1-9)
-- -----------------------------------------------------------
ALTER TABLE public.warranties 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
    CREATE TRIGGER trg_warranties_updated_at
        BEFORE UPDATE ON public.warranties
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------
-- BONUS: Add updated_at to subscription_orders (P1-6)
-- -----------------------------------------------------------
ALTER TABLE public.subscription_orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
    CREATE TRIGGER trg_subscription_orders_updated_at
        BEFORE UPDATE ON public.subscription_orders
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------
-- BONUS: Fix reset_sequence functions — SECURITY DEFINER (P1-5)
-- -----------------------------------------------------------
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

-- -----------------------------------------------------------
-- BONUS: Remove useless index (P1-7)
-- -----------------------------------------------------------
DROP INDEX IF EXISTS idx_product_contents_active;
