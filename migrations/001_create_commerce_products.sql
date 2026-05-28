-- ================================================================
-- Migration 001: Create commerce_products table
-- Phase 3.5C — Commerce Product Architecture Refactor
-- ================================================================

BEGIN;

-- 1. Create commerce_products table
CREATE TABLE IF NOT EXISTS public.commerce_products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_content_id UUID NOT NULL REFERENCES public.product_contents(id) ON DELETE CASCADE,
    sku             TEXT NOT NULL UNIQUE,
    price           INTEGER NOT NULL,
    compare_at_price INTEGER,
    currency        TEXT NOT NULL DEFAULT 'TWD',
    stock_quantity  INTEGER DEFAULT 0,
    stock_status    TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'pre_order')),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    preorder        BOOLEAN NOT NULL DEFAULT false,
    preorder_message TEXT,
    shipping_class  TEXT DEFAULT 'standard',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure one commerce record per product_content
    CONSTRAINT uq_commerce_product_content UNIQUE (product_content_id)
);

-- 2. Enable RLS
ALTER TABLE public.commerce_products ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Anyone can read active products
CREATE POLICY commerce_products_select_all
    ON public.commerce_products
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Only service role can insert/update/delete
CREATE POLICY commerce_products_insert_service
    ON public.commerce_products
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY commerce_products_update_service
    ON public.commerce_products
    FOR UPDATE
    TO service_role
    USING (true);

CREATE POLICY commerce_products_delete_service
    ON public.commerce_products
    FOR DELETE
    TO service_role
    USING (true);

-- 4. Indexes
CREATE INDEX idx_commerce_products_sku ON public.commerce_products(sku);
CREATE INDEX idx_commerce_products_stock_status ON public.commerce_products(stock_status);
CREATE INDEX idx_commerce_products_active ON public.commerce_products(is_active) WHERE is_active = true;

-- 5. Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_commerce_products_updated_at
    BEFORE UPDATE ON public.commerce_products
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 6. Seed data — real product pricing
INSERT INTO public.commerce_products (
    product_content_id,
    sku,
    price,
    compare_at_price,
    currency,
    stock_quantity,
    stock_status,
    is_active,
    preorder,
    preorder_message,
    shipping_class
) VALUES
    -- M81 鮮濕糧智慧餵食器
    ((SELECT id FROM public.product_contents WHERE sku = 'WH-M81-TW'), 'WH-M81-TW', 5980, 6980, 'TWD', 120, 'in_stock', true, false, null, 'standard'),
    -- M12 智慧全景餵食器
    ((SELECT id FROM public.product_contents WHERE sku = 'WH-M12-TW'), 'WH-M12-TW', 3280, 3980, 'TWD', 85, 'in_stock', true, false, null, 'standard'),
    -- M31 智慧扭蛋餵食器
    ((SELECT id FROM public.product_contents WHERE sku = 'WH-M31-TW'), 'WH-M31-TW', 2680, 3280, 'TWD', 200, 'in_stock', true, false, null, 'standard'),
    -- D11-BA 智慧寵物飲水機
    ((SELECT id FROM public.product_contents WHERE sku = 'WH-D11BA-TW'), 'WH-D11BA-TW', 2480, 2980, 'TWD', 0, 'out_of_stock', true, false, null, 'standard'),
    -- D61 智慧不鏽鋼寵物飲水機
    ((SELECT id FROM public.product_contents WHERE sku = 'WH-D61-TW'), 'WH-D61-TW', 3280, 3880, 'TWD', 45, 'low_stock', true, false, null, 'standard');

COMMIT;
