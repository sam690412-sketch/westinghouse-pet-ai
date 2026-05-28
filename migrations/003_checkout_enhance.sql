-- ================================================================
-- Migration 003: Checkout Enhancements
-- Add customer info fields to orders, enhance indexes
-- Phase 3.8 — Checkout & Order System
-- ================================================================

BEGIN;

-- Add customer contact fields to orders (for guest checkout)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS note TEXT;

-- Index on order_number for fast lookup
CREATE INDEX IF NOT EXISTS idx_orders_number_lookup
  ON public.orders(order_number);

-- Index on customer_phone for order lookup
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone
  ON public.orders(customer_phone)
  WHERE customer_phone IS NOT NULL;

-- Ensure order_items has FK to commerce_products via sku
-- (already validated by application layer, but add for integrity)
DO $$
BEGIN
  -- Check if FK already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_order_items_commerce_sku'
    AND table_name = 'order_items'
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT fk_order_items_commerce_sku
      FOREIGN KEY (sku) REFERENCES public.commerce_products(sku)
      ON DELETE RESTRICT;
  END IF;
END $$;

COMMIT;
