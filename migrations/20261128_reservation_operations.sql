-- V3.4 additive migration. Existing reservations and original payloads are retained.
BEGIN;
SET LOCAL lock_timeout = '10s';
ALTER TABLE public.early_bird_reservations
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','pending_contact','contacted','confirmed','cancelled')),
  ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.admin_users(id);
CREATE INDEX IF NOT EXISTS idx_early_bird_reservations_status_created
  ON public.early_bird_reservations(status, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_early_bird_reservations_items_gin
  ON public.early_bird_reservations USING gin(items jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_admin_audit_reservation_target
  ON public.admin_audit_logs(target_type, target_id, created_at DESC)
  WHERE target_type = 'early_bird_reservations';
COMMIT;
