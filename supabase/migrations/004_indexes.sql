-- ============================================================
-- 004_indexes.sql
-- All indexes including search, lookup, and foreign key support
-- ============================================================

-- Product search: simple + pg_trgm (MVP, no chinese dictionary)
CREATE INDEX IF NOT EXISTS idx_product_contents_search_simple
    ON public.product_contents
    USING gin(to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(short_description,'')));

CREATE INDEX IF NOT EXISTS idx_product_contents_name_trgm
    ON public.product_contents
    USING gin(name gin_trgm_ops);

-- Product filters
CREATE INDEX IF NOT EXISTS idx_product_contents_category
    ON public.product_contents(category)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_product_contents_slug
    ON public.product_contents(slug);

CREATE INDEX IF NOT EXISTS idx_product_contents_solutions
    ON public.product_contents USING gin(solutions);

-- Soft delete filter
CREATE INDEX IF NOT EXISTS idx_product_contents_active
    ON public.product_contents(id)
    WHERE deleted_at IS NULL;

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_member_created
    ON public.orders(member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status_created
    ON public.orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_number
    ON public.orders(order_number);

-- Warranty indexes
CREATE INDEX IF NOT EXISTS idx_warranties_member
    ON public.warranties(member_id, status);

CREATE INDEX IF NOT EXISTS idx_warranties_code
    ON public.warranties(warranty_code);

CREATE INDEX IF NOT EXISTS idx_warranties_sku
    ON public.warranties(product_sku);

-- Ticket indexes
CREATE INDEX IF NOT EXISTS idx_tickets_member
    ON public.tickets(member_id, status);

CREATE INDEX IF NOT EXISTS idx_tickets_assigned
    ON public.tickets(assigned_to, status);

CREATE INDEX IF NOT EXISTS idx_tickets_status_created
    ON public.tickets(status, created_at DESC);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_published
    ON public.reviews(product_id, is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_member
    ON public.reviews(member_id);

CREATE INDEX IF NOT EXISTS idx_reviews_images
    ON public.reviews USING gin(images);

-- Cart indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_member
    ON public.cart_items(member_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_expires
    ON public.cart_items(expires_at);

-- Learn article search
CREATE INDEX IF NOT EXISTS idx_learn_articles_search_simple
    ON public.learn_articles
    USING gin(to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(excerpt,'')));

CREATE INDEX IF NOT EXISTS idx_learn_articles_cat_slug
    ON public.learn_articles(category, slug)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_learn_articles_published
    ON public.learn_articles(is_published, published_at DESC)
    WHERE is_published = true AND deleted_at IS NULL;

-- Solution indexes
CREATE INDEX IF NOT EXISTS idx_solutions_slug
    ON public.solutions(slug)
    WHERE is_published = true;

-- Job queue indexes
CREATE INDEX IF NOT EXISTS idx_job_queue_available
    ON public.job_queue(queue_name, available_at)
    WHERE status = 'pending' AND attempts < max_attempts;

CREATE INDEX IF NOT EXISTS idx_job_queue_reserved
    ON public.job_queue(reserved_at)
    WHERE status = 'processing';

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_resource
    ON public.audit_log(resource, resource_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_user
    ON public.audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_created
    ON public.audit_log(created_at DESC);
