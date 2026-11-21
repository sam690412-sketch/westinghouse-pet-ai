-- Apply to the configured PostgreSQL database before enabling prelaunch form.
CREATE TABLE IF NOT EXISTS early_bird_reservations (
 id BIGSERIAL PRIMARY KEY,
 name VARCHAR(120) NOT NULL,
 email VARCHAR(200) NOT NULL,
 contact VARCHAR(200) NOT NULL,
 region VARCHAR(120) NOT NULL,
 locale VARCHAR(5) NOT NULL CHECK (locale IN ('zh-TW','en','th')),
 items JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_early_bird_reservations_created_at ON early_bird_reservations(created_at DESC);
-- Restrict access to application DB role; do not expose via public SQL endpoints.
