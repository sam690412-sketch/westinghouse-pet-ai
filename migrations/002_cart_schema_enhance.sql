-- ================================================================
-- Migration 002: Cart Schema Enhancement
-- Phase 3.7 — Cart System Implementation
-- ================================================================

BEGIN;

-- 1. Add FK from cart_items to commerce_products for SKU validation
ALTER TABLE public.cart_items
  ADD CONSTRAINT fk_cart_items_commerce_product
  FOREIGN KEY (product_sku) REFERENCES public.commerce_products(sku)
  ON DELETE CASCADE;

-- 2. Add quantity > 0 check
ALTER TABLE public.cart_items
  ADD CONSTRAINT chk_cart_items_quantity_positive
  CHECK (quantity > 0);

-- 3. Add expires_at must be in future check
ALTER TABLE public.cart_items
  ADD CONSTRAINT chk_cart_items_not_expired
  CHECK (expires_at > created_at);

-- 4. Index on product_sku for JOIN performance
CREATE INDEX IF NOT EXISTS idx_cart_items_product_sku
  ON public.cart_items(product_sku);

-- 5. Index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_cart_items_expires_at
  ON public.cart_items(expires_at);

-- 6. Ensure only active products can be in cart
-- (FK to commerce_products already ensures sku exists,
--  but we also want is_active=true check at application level)

COMMIT;
