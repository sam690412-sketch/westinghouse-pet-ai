-- ============================================================
-- 003_core_tables.sql
-- Core tables with constraints, FKs, and CHECKs
-- ============================================================

-- 1. members — extends auth.users (canonical identity = auth.users.id UUID)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    line_id TEXT,
    role member_role NOT NULL DEFAULT 'member',
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.members IS 'Member profile extending Supabase Auth. ID = auth.users.id (immutable)';
COMMENT ON COLUMN public.members.id IS 'FK to auth.users.id — canonical identity, never changes';

-- 2. product_contents — brand content (synced from Payload CMS payload.products)
CREATE TABLE IF NOT EXISTS public.product_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    short_description TEXT,
    description JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    category TEXT NOT NULL CHECK (category IN ('feeder', 'water_dispenser', 'accessory')),
    solutions TEXT[] DEFAULT '{}',
    meta_title TEXT,
    meta_description TEXT,
    faq_items JSONB DEFAULT '[]'::jsonb,
    how_to_steps JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    hero_image_url TEXT,
    deleted_at TIMESTAMPTZ,          -- soft delete
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_product_contents_slug UNIQUE (slug),
    CONSTRAINT uq_product_contents_sku UNIQUE (sku)
);

COMMENT ON TABLE public.product_contents IS 'Product brand content. Synced from Payload CMS payload schema.';
COMMENT ON COLUMN public.product_contents.deleted_at IS 'Soft delete timestamp. NULL = active.';

-- 3. orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL,
    member_id UUID NOT NULL REFERENCES public.members(id),
    status order_status NOT NULL DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    payment_method TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_orders_number UNIQUE (order_number)
);

-- 4. order_items — snapshot (no FK to product, historical integrity)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    subtotal INTEGER NOT NULL,
    CONSTRAINT chk_order_items_subtotal CHECK (subtotal = quantity * unit_price)
);

-- 5. payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    transaction_id TEXT,
    provider TEXT NOT NULL CHECK (provider IN ('newebpay', 'linepay')),
    amount INTEGER NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'TWD',
    status payment_status NOT NULL DEFAULT 'pending',
    provider_response JSONB DEFAULT '{}'::jsonb,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_payments_transaction UNIQUE (transaction_id)
);

-- 6. warranties — snapshot product info (historical)
CREATE TABLE IF NOT EXISTS public.warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warranty_code TEXT NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    product_sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    serial_number TEXT,
    purchase_date DATE,
    expiry_date DATE,
    purchase_channel TEXT,
    status warranty_status NOT NULL DEFAULT 'active',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_warranties_code UNIQUE (warranty_code)
);

-- 7. tickets
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    warranty_id UUID REFERENCES public.warranties(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    product_sku TEXT,
    issue_type TEXT NOT NULL CHECK (issue_type IN ('defect', 'damage', 'usage', 'other')),
    issue_description TEXT NOT NULL,
    status ticket_status NOT NULL DEFAULT 'new',
    priority ticket_priority NOT NULL DEFAULT 'medium',
    assigned_to UUID REFERENCES public.members(id) ON DELETE SET NULL,
    notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_tickets_number UNIQUE (ticket_number)
);

-- 8. reviews — FK to product_contents for live product link
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.product_contents(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    images TEXT[] DEFAULT '{}',
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. cart_items — with expiration for abandoned cart cleanup
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    product_sku TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_cart_items_member_product UNIQUE (member_id, product_sku)
);

-- 10. product_bundles
CREATE TABLE IF NOT EXISTS public.product_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    bundle_price INTEGER NOT NULL CHECK (bundle_price >= 0),
    original_total INTEGER NOT NULL CHECK (original_total >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_product_bundles_slug UNIQUE (slug)
);

-- 11. subscription_orders
CREATE TABLE IF NOT EXISTS public.subscription_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    product_sku TEXT NOT NULL,
    frequency subscription_frequency NOT NULL,
    discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    price INTEGER NOT NULL CHECK (price >= 0),
    status subscription_status NOT NULL DEFAULT 'active',
    cancellation_reason TEXT,
    next_delivery_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. learn_articles — synced from Payload CMS
CREATE TABLE IF NOT EXISTS public.learn_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('water_health', 'feeding', 'tutorials', 'buying_guides', 'reviews', 'pet_health')),
    title TEXT NOT NULL,
    excerpt TEXT,
    content JSONB DEFAULT '[]'::jsonb,
    meta_title TEXT,
    meta_description TEXT,
    focus_keyword TEXT,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_learn_articles_cat_slug UNIQUE (slug, category)
);

-- 13. solutions — synced from Payload CMS
CREATE TABLE IF NOT EXISTS public.solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    pain_point TEXT,
    audience TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    recommended_products TEXT[] DEFAULT '{}',
    meta_title TEXT,
    meta_description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_solutions_slug UNIQUE (slug)
);

-- 14. job_queue — replaces pgmq (custom queue table)
CREATE TABLE IF NOT EXISTS public.job_queue (
    id BIGSERIAL PRIMARY KEY,
    queue_name TEXT NOT NULL CHECK (queue_name IN ('email_jobs', 'webhook_jobs', 'sync_jobs')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status job_status NOT NULL DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reserved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. audit_log — immutable append-only
CREATE TABLE IF NOT EXISTS public.audit_log (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID,
    user_role TEXT,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT', 'VIEW')),
    resource TEXT NOT NULL,
    resource_id TEXT,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT
);

-- Make audit_log truly immutable
REVOKE UPDATE, DELETE ON public.audit_log FROM PUBLIC;
REVOKE UPDATE, DELETE ON public.audit_log FROM authenticated;
REVOKE UPDATE, DELETE ON public.audit_log FROM anon;
REVOKE UPDATE, DELETE ON public.audit_log FROM service_role;

-- Also add trigger protection as defense-in-depth
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log is immutable. UPDATE and DELETE are not allowed.';
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    CREATE TRIGGER trg_audit_log_prevent_update
        BEFORE UPDATE ON public.audit_log
        FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER trg_audit_log_prevent_delete
        BEFORE DELETE ON public.audit_log
        FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;
