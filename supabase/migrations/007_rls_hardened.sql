-- ============================================================
-- 007_rls_hardened.sql
-- Phase 3.2 Hardened Audit — RLS Policy Fixes (P1)
--
-- Fixes:
-- P1-1: Add admin UPDATE policy for members
-- P1-2: Restrict DELETE to admin only (support/ops cannot delete products)
-- P1-3: Members can only edit unpublished reviews
-- P1-4: Add slug/sku format validation
-- ============================================================

-- -----------------------------------------------------------
-- P1-1: Admin can update member profiles (role changes, etc.)
-- -----------------------------------------------------------
CREATE POLICY "members_admin_update"
    ON public.members FOR UPDATE
    USING (is_admin());

-- -----------------------------------------------------------
-- P1-2: Restrict product deletion to admin only
-- Remove overly permissive blanket policy, replace with granular
-- -----------------------------------------------------------
DROP POLICY IF EXISTS "product_contents_admin_all" ON public.product_contents;

-- Admin/support/ops can read all products (including soft-deleted)
CREATE POLICY "product_contents_admin_select"
    ON public.product_contents FOR SELECT
    USING (is_admin());

-- Admin/ops can insert
CREATE POLICY "product_contents_admin_insert"
    ON public.product_contents FOR INSERT
    WITH CHECK ((SELECT role FROM public.members WHERE id = auth.uid()) IN ('admin', 'ops'));

-- Admin/support/ops can update
CREATE POLICY "product_contents_admin_update"
    ON public.product_contents FOR UPDATE
    USING (is_admin());

-- ONLY admin can delete (support and ops cannot)
CREATE POLICY "product_contents_admin_delete"
    ON public.product_contents FOR DELETE
    USING ((SELECT role FROM public.members WHERE id = auth.uid()) = 'admin');

-- Same pattern for learn_articles
DROP POLICY IF EXISTS "learn_articles_admin_all" ON public.learn_articles;

CREATE POLICY "learn_articles_admin_select"
    ON public.learn_articles FOR SELECT
    USING (is_admin());
CREATE POLICY "learn_articles_admin_insert"
    ON public.learn_articles FOR INSERT
    WITH CHECK ((SELECT role FROM public.members WHERE id = auth.uid()) IN ('admin', 'ops', 'marketing'));
CREATE POLICY "learn_articles_admin_update"
    ON public.learn_articles FOR UPDATE
    USING (is_admin());
CREATE POLICY "learn_articles_admin_delete"
    ON public.learn_articles FOR DELETE
    USING ((SELECT role FROM public.members WHERE id = auth.uid()) = 'admin');

-- Same pattern for solutions
DROP POLICY IF EXISTS "solutions_admin_all" ON public.solutions;

CREATE POLICY "solutions_admin_select"
    ON public.solutions FOR SELECT
    USING (is_admin());
CREATE POLICY "solutions_admin_insert"
    ON public.solutions FOR INSERT
    WITH CHECK ((SELECT role FROM public.members WHERE id = auth.uid()) IN ('admin', 'ops', 'marketing'));
CREATE POLICY "solutions_admin_update"
    ON public.solutions FOR UPDATE
    USING (is_admin());
CREATE POLICY "solutions_admin_delete"
    ON public.solutions FOR DELETE
    USING ((SELECT role FROM public.members WHERE id = auth.uid()) = 'admin');

-- -----------------------------------------------------------
-- P1-3: Members can only update UNPUBLISHED reviews
-- -----------------------------------------------------------
DROP POLICY IF EXISTS "reviews_own_update" ON public.reviews;

CREATE POLICY "reviews_own_update_unpublished"
    ON public.reviews FOR UPDATE
    USING (member_id = auth.uid() AND is_published = false);

-- -----------------------------------------------------------
-- P1-4: Add slug/sku format validation
-- -----------------------------------------------------------
ALTER TABLE public.product_contents
ADD CONSTRAINT chk_slug_format CHECK (slug ~ '^[a-z0-9-]+$');

ALTER TABLE public.product_contents
ADD CONSTRAINT chk_sku_format CHECK (sku ~ '^WH-[A-Z0-9]+-TW$');
