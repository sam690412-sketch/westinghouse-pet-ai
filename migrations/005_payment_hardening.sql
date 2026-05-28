-- ============================================================
-- 005_payment_hardening.sql
-- Payment hardening: idempotency columns + audit log + inventory
-- Phase 3.10 — Payment Hardening + Inventory Finalization
-- ============================================================

-- 1. Add idempotency columns to payments
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT,
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS inventory_decremented_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS webhook_event_id TEXT,
    ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Unique constraint on provider_transaction_id (when not null)
-- This prevents duplicate webhooks from the same provider transaction
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_provider_tx
    ON public.payments (provider_transaction_id)
    WHERE provider_transaction_id IS NOT NULL;

-- Index for webhook deduplication
CREATE INDEX IF NOT EXISTS idx_payments_webhook_event_id
    ON public.payments (webhook_event_id)
    WHERE webhook_event_id IS NOT NULL;

-- 2. Audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    order_number TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON public.audit_log (event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_order_number ON public.audit_log (order_number);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);

-- 3. Helper function: insert audit log
CREATE OR REPLACE FUNCTION public.log_audit(
    p_event_type TEXT,
    p_table_name TEXT DEFAULT NULL,
    p_record_id TEXT DEFAULT NULL,
    p_order_number TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.audit_log (event_type, table_name, record_id, order_number, details)
    VALUES (p_event_type, p_table_name, p_record_id, p_order_number, p_details)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

-- 4. Helper function: decrement inventory for a paid order
-- This is called ONLY after verified payment, never before
-- It is idempotent: calling twice for the same order is a no-op
CREATE OR REPLACE FUNCTION public.decrement_order_inventory(p_order_id UUID)
RETURNS TABLE (sku TEXT, old_qty INT, new_qty INT, new_status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if already decremented (idempotency)
    IF EXISTS (
        SELECT 1 FROM public.payments
        WHERE order_id = p_order_id AND inventory_decremented_at IS NOT NULL
    ) THEN
        RETURN; -- Already done, return empty
    END IF;

    -- Check if payment is actually completed
    IF NOT EXISTS (
        SELECT 1 FROM public.payments
        WHERE order_id = p_order_id AND status = 'completed'
    ) THEN
        RAISE EXCEPTION 'Payment not completed for order %', p_order_id;
    END IF;

    -- Decrement stock for each order item
    RETURN QUERY
    WITH items AS (
        SELECT oi.sku, oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = p_order_id
    ),
    decremented AS (
        UPDATE public.commerce_products cp
        SET stock_quantity = GREATEST(0, cp.stock_quantity - i.quantity)
        FROM items i
        WHERE cp.sku = i.sku
        RETURNING cp.sku, cp.stock_quantity AS new_qty, i.quantity AS deducted
    ),
    updated_status AS (
        UPDATE public.commerce_products cp
        SET stock_status = CASE
            WHEN cp.stock_quantity = 0 THEN 'out_of_stock'
            WHEN cp.stock_quantity <= 5 THEN 'low_stock'
            ELSE 'in_stock'
        END
        FROM decremented d
        WHERE cp.sku = d.sku
        RETURNING cp.sku, cp.stock_quantity, cp.stock_status
    )
    SELECT
        d.sku,
        d.new_qty + d.deducted,
        d.new_qty,
        us.stock_status
    FROM decremented d
    JOIN updated_status us ON d.sku = us.sku;

    -- Mark inventory as decremented
    UPDATE public.payments
    SET inventory_decremented_at = NOW()
    WHERE order_id = p_order_id;
END;
$$;

-- 5. Helper function: update payment with idempotency check
-- Returns true if processed, false if duplicate
CREATE OR REPLACE FUNCTION public.process_payment_webhook(
    p_order_id UUID,
    p_provider_transaction_id TEXT,
    p_webhook_event_id TEXT,
    p_is_success BOOLEAN,
    p_provider_response JSONB DEFAULT '{}'::jsonb,
    p_failure_reason TEXT DEFAULT NULL
)
RETURNS TABLE (processed BOOLEAN, order_status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_payment_status TEXT;
    v_current_order_status TEXT;
    v_new_payment_status TEXT;
    v_new_order_status TEXT;
BEGIN
    -- Lock the payment row for this order
    SELECT p.status, o.status
    INTO v_current_payment_status, v_current_order_status
    FROM public.payments p
    JOIN public.orders o ON o.id = p.order_id
    WHERE p.order_id = p_order_id
    FOR UPDATE;

    -- If already processed with this provider transaction, it's a duplicate
    IF p_provider_transaction_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.payments
        WHERE provider_transaction_id = p_provider_transaction_id
          AND id != (SELECT id FROM public.payments WHERE order_id = p_order_id LIMIT 1)
    ) THEN
        RETURN QUERY SELECT FALSE, v_current_order_status;
        RETURN;
    END IF;

    -- If order is not pending, don't reprocess
    IF v_current_order_status != 'pending' THEN
        RETURN QUERY SELECT FALSE, v_current_order_status;
        RETURN;
    END IF;

    -- Determine new statuses
    IF p_is_success THEN
        v_new_payment_status := 'completed';
        v_new_order_status := 'paid';
    ELSE
        v_new_payment_status := 'failed';
        v_new_order_status := 'pending'; -- Order stays pending on failure, can retry
    END IF;

    -- Update payment
    UPDATE public.payments
    SET
        status = v_new_payment_status,
        provider_transaction_id = COALESCE(p_provider_transaction_id, provider_transaction_id),
        webhook_event_id = COALESCE(p_webhook_event_id, webhook_event_id),
        provider_response = provider_response || p_provider_response,
        failure_reason = COALESCE(p_failure_reason, failure_reason),
        processed_at = NOW(),
        paid_at = CASE WHEN p_is_success THEN NOW() ELSE paid_at END
    WHERE order_id = p_order_id;

    -- Update order
    UPDATE public.orders
    SET status = v_new_order_status, updated_at = NOW()
    WHERE id = p_order_id;

    RETURN QUERY SELECT TRUE, v_new_order_status;
END;
$$;
