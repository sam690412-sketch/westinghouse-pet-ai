-- ============================================================
-- 006_warranty_support.sql
-- Warranty & after-sales support enhancements
-- Phase 3.12 — Warranty & After-sales Support Portal
-- ============================================================

-- 1. Enhance warranties table
ALTER TABLE public.warranties
    ADD COLUMN IF NOT EXISTS proof_url TEXT,
    ADD COLUMN IF NOT EXISTS extension_notes TEXT,
    ADD COLUMN IF NOT EXISTS extended_by TEXT,
    ADD COLUMN IF NOT EXISTS customer_name TEXT,
    ADD COLUMN IF NOT EXISTS customer_phone TEXT,
    ADD COLUMN IF NOT EXISTS customer_email TEXT,
    ADD COLUMN IF NOT EXISTS order_number TEXT;

CREATE INDEX IF NOT EXISTS idx_warranties_phone ON public.warranties (customer_phone) WHERE customer_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_warranties_serial ON public.warranties (serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_warranties_sku ON public.warranties (product_sku);

-- 2. Enhance tickets table
ALTER TABLE public.tickets
    ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS internal_notes JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS warranty_code TEXT;

CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_sku ON public.tickets (product_sku) WHERE product_sku IS NOT NULL;

-- 3. Helper: generate warranty code
CREATE OR REPLACE FUNCTION public.generate_warranty_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_code TEXT;
    v_date TEXT;
BEGIN
    v_date := to_char(now(), 'YYYYMMDD');
    v_code := 'W-' || v_date || '-' || LPAD(floor(random() * 9999)::text, 4, '0');
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.warranties WHERE warranty_code = v_code) LOOP
        v_code := 'W-' || v_date || '-' || LPAD(floor(random() * 9999)::text, 4, '0');
    END LOOP;
    RETURN v_code;
END;
$$;

-- 4. Helper: generate ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_code TEXT;
    v_date TEXT;
BEGIN
    v_date := to_char(now(), 'YYYYMMDD');
    v_code := 'T-' || v_date || '-' || LPAD(floor(random() * 9999)::text, 4, '0');
    WHILE EXISTS (SELECT 1 FROM public.tickets WHERE ticket_number = v_code) LOOP
        v_code := 'T-' || v_date || '-' || LPAD(floor(random() * 9999)::text, 4, '0');
    END LOOP;
    RETURN v_code;
END;
$$;

-- 5. Helper: add ticket timeline entry
CREATE OR REPLACE FUNCTION public.add_ticket_timeline(
    p_ticket_id UUID,
    p_status TEXT,
    p_note TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.tickets
    SET timeline = COALESCE(timeline, '[]'::jsonb) || jsonb_build_object(
        'status', p_status,
        'note', p_note,
        'timestamp', now()
    ),
    updated_at = now()
    WHERE id = p_ticket_id;
END;
$$;
