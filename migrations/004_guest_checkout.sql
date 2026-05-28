-- ================================================================
-- Migration 004: Guest Checkout Support
-- Make member_id nullable for guest orders
-- Phase 3.8 — Checkout & Order System
-- ================================================================

BEGIN;

-- Make member_id nullable (guest checkout doesn't require member)
ALTER TABLE public.orders
  ALTER COLUMN member_id DROP NOT NULL;

-- Add guest flag for analytics
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT true;

COMMIT;
