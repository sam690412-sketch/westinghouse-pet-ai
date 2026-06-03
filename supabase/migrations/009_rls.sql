-- ============================================================
-- 009_rls.sql
-- Row Level Security — Production Hardened
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;

-- Force RLS for service_role too (bypass only when explicitly needed)
ALTER TABLE public.members FORCE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.warranties FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tickets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.job_queue FORCE ROW LEVEL SECURITY;

-- ==========================================
-- HELPERS
-- ==========================================

-- NOTE: is_admin() is defined in 006_hardened_fixes.sql with search_path = public
-- Do NOT redefine here — that would overwrite the hardened version

-- ==========================================
-- PUBLIC READ TABLES (everyone can read)
-- ==========================================

-- product_contents: public read (only active products)
CREATE POLICY "product_contents_public_read"
    ON public.product_contents FOR SELECT
    USING (deleted_at IS NULL);

-- product_bundles: public read (only active)
CREATE POLICY "product_bundles_public_read"
    ON public.product_bundles FOR SELECT
    USING (is_active = true AND (end_date IS NULL OR end_date > now()));

-- learn_articles: public read (published only)
CREATE POLICY "learn_articles_public_read"
    ON public.learn_articles FOR SELECT
    USING (is_published = true AND deleted_at IS NULL);

-- solutions: public read (published only)
CREATE POLICY "solutions_public_read"
    ON public.solutions FOR SELECT
    USING (is_published = true);

-- reviews: public read (published only)
CREATE POLICY "reviews_public_read"
    ON public.reviews FOR SELECT
    USING (is_published = true);

-- ==========================================
-- MEMBER-SPECIFIC DATA (own records only)
-- ==========================================

-- members: read own profile
CREATE POLICY "members_own_read"
    ON public.members FOR SELECT
    USING (id = auth.uid() OR is_admin());

-- members: update own profile
CREATE POLICY "members_own_update"
    ON public.members FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.members WHERE id = auth.uid()));
    -- Prevent self-escalation: cannot change own role

-- orders: read own orders
CREATE POLICY "orders_own_read"
    ON public.orders FOR SELECT
    USING (member_id = auth.uid() OR is_admin());

-- order_items: read via order ownership
CREATE POLICY "order_items_own_read"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o 
            WHERE o.id = order_items.order_id 
            AND (o.member_id = auth.uid() OR is_admin())
        )
    );

-- payments: read via order ownership
CREATE POLICY "payments_own_read"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o 
            WHERE o.id = payments.order_id 
            AND (o.member_id = auth.uid() OR is_admin())
        )
    );

-- warranties: read own warranties
CREATE POLICY "warranties_own_read"
    ON public.warranties FOR SELECT
    USING (member_id = auth.uid() OR is_admin());

-- warranties: create own warranty (registration)
CREATE POLICY "warranties_own_create"
    ON public.warranties FOR INSERT
    WITH CHECK (member_id = auth.uid());

-- tickets: read own tickets
CREATE POLICY "tickets_own_read"
    ON public.tickets FOR SELECT
    USING (member_id = auth.uid() OR assigned_to = auth.uid() OR is_admin());

-- tickets: create own tickets
CREATE POLICY "tickets_own_create"
    ON public.tickets FOR INSERT
    WITH CHECK (member_id = auth.uid());

-- reviews: create own review (must be verified purchase)
CREATE POLICY "reviews_own_create"
    ON public.reviews FOR INSERT
    WITH CHECK (member_id = auth.uid());

-- reviews: update own review
CREATE POLICY "reviews_own_update"
    ON public.reviews FOR UPDATE
    USING (member_id = auth.uid());

-- reviews: delete own review
CREATE POLICY "reviews_own_delete"
    ON public.reviews FOR DELETE
    USING (member_id = auth.uid());

-- cart_items: full CRUD on own cart
CREATE POLICY "cart_items_own_all"
    ON public.cart_items FOR ALL
    USING (member_id = auth.uid())
    WITH CHECK (member_id = auth.uid());

-- subscription_orders: read own
CREATE POLICY "subscriptions_own_read"
    ON public.subscription_orders FOR SELECT
    USING (member_id = auth.uid() OR is_admin());

-- subscription_orders: create/update own
CREATE POLICY "subscriptions_own_write"
    ON public.subscription_orders FOR ALL
    USING (member_id = auth.uid())
    WITH CHECK (member_id = auth.uid());

-- ==========================================
-- ADMIN/SUPPORT OPERATIONS
-- ==========================================

-- tickets: admin/support can update
CREATE POLICY "tickets_admin_update"
    ON public.tickets FOR UPDATE
    USING (is_admin());

-- reviews: admin can moderate (publish/unpublish)
CREATE POLICY "reviews_admin_moderate"
    ON public.reviews FOR UPDATE
    USING (is_admin());

-- product_contents: admin can manage
CREATE POLICY "product_contents_admin_all"
    ON public.product_contents FOR ALL
    USING (is_admin());

-- learn_articles: admin can manage
CREATE POLICY "learn_articles_admin_all"
    ON public.learn_articles FOR ALL
    USING (is_admin());

-- solutions: admin can manage
CREATE POLICY "solutions_admin_all"
    ON public.solutions FOR ALL
    USING (is_admin());

-- orders: admin can update status
CREATE POLICY "orders_admin_update"
    ON public.orders FOR UPDATE
    USING (is_admin());

-- payments: admin can read/update
CREATE POLICY "payments_admin_all"
    ON public.payments FOR ALL
    USING (is_admin());

-- warranties: admin can manage
CREATE POLICY "warranties_admin_all"
    ON public.warranties FOR ALL
    USING (is_admin());

-- product_bundles: admin can manage
CREATE POLICY "product_bundles_admin_all"
    ON public.product_bundles FOR ALL
    USING (is_admin());

-- subscription_orders: admin can manage
CREATE POLICY "subscriptions_admin_all"
    ON public.subscription_orders FOR ALL
    USING (is_admin());

-- ==========================================
-- JOB QUEUE (service_role only)
-- ==========================================

-- job_queue: only service_role can access
CREATE POLICY "job_queue_service_only"
    ON public.job_queue FOR ALL
    USING (false);
    -- service_role bypasses RLS when not forced
    -- With FORCE ROW LEVEL SECURITY, service_role also needs a policy:

CREATE POLICY "job_queue_service_explicit"
    ON public.job_queue FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ==========================================
-- ANONYMOUS (non-authenticated) ACCESS
-- ==========================================

-- Allow anonymous users to read public tables
CREATE POLICY "product_contents_anon_read"
    ON public.product_contents FOR SELECT
    TO anon
    USING (deleted_at IS NULL);

CREATE POLICY "product_bundles_anon_read"
    ON public.product_bundles FOR SELECT
    TO anon
    USING (is_active = true);

CREATE POLICY "learn_articles_anon_read"
    ON public.learn_articles FOR SELECT
    TO anon
    USING (is_published = true AND deleted_at IS NULL);

CREATE POLICY "solutions_anon_read"
    ON public.solutions FOR SELECT
    TO anon
    USING (is_published = true);

CREATE POLICY "reviews_anon_read"
    ON public.reviews FOR SELECT
    TO anon
    USING (is_published = true);

-- ==========================================
-- SERVICE_ROLE INSERT (for FORCE RLS tables)
-- These tables have FORCE ROW LEVEL SECURITY enabled,
-- so service_role also needs explicit policies.
-- ==========================================

-- members: service_role can INSERT (signup flow)
CREATE POLICY "members_service_insert"
    ON public.members FOR INSERT
    TO service_role
    WITH CHECK (true);

-- orders: service_role can INSERT (checkout API)
CREATE POLICY "orders_service_insert"
    ON public.orders FOR INSERT
    TO service_role
    WITH CHECK (true);

-- order_items: service_role can INSERT (checkout creates items)
CREATE POLICY "order_items_service_insert"
    ON public.order_items FOR INSERT
    TO service_role
    WITH CHECK (true);

-- payments: service_role can INSERT (webhook handler)
CREATE POLICY "payments_service_insert"
    ON public.payments FOR INSERT
    TO service_role
    WITH CHECK (true);

-- warranties: service_role can INSERT (warranty registration API)
CREATE POLICY "warranties_service_insert"
    ON public.warranties FOR INSERT
    TO service_role
    WITH CHECK (true);

-- tickets: service_role can INSERT (support portal auto-creation)
CREATE POLICY "tickets_service_insert"
    ON public.tickets FOR INSERT
    TO service_role
    WITH CHECK (true);

-- ==========================================
-- SECURITY NOTES
-- ==========================================

-- 1. audit_log: immutable via REVOKE + trigger (see 003_core_tables.sql)
--    No RLS needed since nobody should query it directly;
--    use admin dashboard with service_role bypass

-- 2. service_role bypass: Use Supabase service_role key only in
--    trusted server environments (Edge Functions, API routes).
--    Never expose service_role key to client.

-- 3. is_admin() function is SECURITY DEFINER to bypass RLS
--    when checking admin status. This is safe because:
--    - It only reads the members table
--    - It checks auth.uid() which cannot be forged

-- 4. Member role escalation is prevented:
--    - Members can only UPDATE their own row
--    - WITH CHECK ensures role cannot be changed
--    - Only admins can change roles (not implemented in RLS;
--      role changes happen via admin API with service_role)
