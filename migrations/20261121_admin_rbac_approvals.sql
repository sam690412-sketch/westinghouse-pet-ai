CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS admin_users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text UNIQUE NOT NULL,
 password_hash text NOT NULL, display_name text NOT NULL DEFAULT '',
 role text NOT NULL CHECK(role IN ('super_admin','operations_manager','marketing_editor','customer_support')),
 is_active boolean NOT NULL DEFAULT true, session_version integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS admin_approval_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 action_type text NOT NULL CHECK(action_type IN ('price_change','store_setting','stock_adjustment','refund','role_change')),
 target_type text NOT NULL, target_id text NOT NULL,
 before_value jsonb NOT NULL, after_value jsonb NOT NULL,
 reason text NOT NULL CHECK(length(trim(reason))>=3),
 requester_id uuid NOT NULL REFERENCES admin_users(id), requester_role text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','conflict')),
 reviewer_id uuid REFERENCES admin_users(id), review_note text,
 created_at timestamptz NOT NULL DEFAULT now(), reviewed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_admin_approvals_status_created ON admin_approval_requests(status,created_at DESC);
CREATE TABLE IF NOT EXISTS admin_audit_logs (
 id bigserial PRIMARY KEY, action_type text NOT NULL, target_type text NOT NULL,
 target_id text NOT NULL, before_value jsonb NOT NULL, after_value jsonb NOT NULL,
 requested_by uuid REFERENCES admin_users(id), approved_by uuid REFERENCES admin_users(id),
 request_id uuid REFERENCES admin_approval_requests(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION prevent_admin_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'audit log immutable'; END $$;
DROP TRIGGER IF EXISTS admin_audit_immutable ON admin_audit_logs;
CREATE TRIGGER admin_audit_immutable BEFORE UPDATE OR DELETE ON admin_audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_admin_audit_mutation();
CREATE TABLE IF NOT EXISTS store_settings(key text PRIMARY KEY,value jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now());
INSERT INTO store_settings(key,value) VALUES('IS_LIVE_STORE','false'::jsonb),('enabled_locales','["zh-TW","en","th"]'::jsonb) ON CONFLICT DO NOTHING;
