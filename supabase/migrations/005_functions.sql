-- ============================================================
-- 005_functions.sql
-- Production-safe functions: number generation, search, triggers
-- ============================================================

-- 1. Order number SEQUENCE (race-condition safe)
CREATE SEQUENCE IF NOT EXISTS public.seq_order_number START 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    prefix TEXT := 'WH-' || to_char(now(), 'YYYYMMDD');
    seq_val INTEGER;
    result TEXT;
    exists_check BOOLEAN;
BEGIN
    -- Get next value from sequence (atomic, concurrent-safe)
    SELECT nextval('public.seq_order_number') INTO seq_val;
    
    result := prefix || '-' || LPAD(seq_val::TEXT, 6, '0');
    
    -- Defensive: check collision (should never happen with sequence)
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_number = result)
    INTO exists_check;
    
    IF exists_check THEN
        -- Retry once with next sequence value
        SELECT nextval('public.seq_order_number') INTO seq_val;
        result := prefix || '-' || LPAD(seq_val::TEXT, 6, '0');
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Reset sequence daily (run via pg_cron or Edge Function cron)
CREATE OR REPLACE FUNCTION public.reset_order_sequence()
RETURNS void AS $$
BEGIN
    ALTER SEQUENCE public.seq_order_number RESTART WITH 1;
END;
$$ LANGUAGE plpgsql;

-- 2. Ticket number SEQUENCE
CREATE SEQUENCE IF NOT EXISTS public.seq_ticket_number START 1;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    prefix TEXT := 'WHT-' || to_char(now(), 'YYYYMMDD');
    seq_val INTEGER;
    result TEXT;
    exists_check BOOLEAN;
BEGIN
    SELECT nextval('public.seq_ticket_number') INTO seq_val;
    result := prefix || '-' || LPAD(seq_val::TEXT, 4, '0');
    
    SELECT EXISTS(SELECT 1 FROM public.tickets WHERE ticket_number = result)
    INTO exists_check;
    
    IF exists_check THEN
        SELECT nextval('public.seq_ticket_number') INTO seq_val;
        result := prefix || '-' || LPAD(seq_val::TEXT, 4, '0');
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.reset_ticket_sequence()
RETURNS void AS $$
BEGIN
    ALTER SEQUENCE public.seq_ticket_number RESTART WITH 1;
END;
$$ LANGUAGE plpgsql;

-- 3. Warranty code — cryptographically secure random
CREATE OR REPLACE FUNCTION public.generate_warranty_code()
RETURNS TEXT AS $$
DECLARE
    prefix TEXT := 'WHA-';
    random_part TEXT;
    result TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Use gen_random_bytes (available in PostgreSQL via pgcrypto-like builtin)
        random_part := upper(encode(gen_random_bytes(4), 'hex'));
        result := prefix || random_part;
        
        SELECT EXISTS(SELECT 1 FROM public.warranties WHERE warranty_code = result)
        INTO exists_check;
        
        EXIT WHEN NOT exists_check;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. Unified search — uses 'simple' (no chinese dictionary) + pg_trgm fallback
CREATE OR REPLACE FUNCTION public.unified_search(query TEXT)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    rank REAL
) AS $$
DECLARE
    normalized_query TEXT;
BEGIN
    normalized_query := lower(trim(query));
    
    -- Search products (simple FTS + trigram similarity)
    RETURN QUERY
    SELECT 
        pc.id,
        'product'::TEXT AS type,
        pc.name AS title,
        '/products/' || pc.slug AS slug,
        LEFT(pc.short_description, 120) AS excerpt,
        (
            COALESCE(ts_rank(to_tsvector('simple', pc.name), plainto_tsquery('simple', normalized_query)), 0) * 2.0 +
            COALESCE(similarity(pc.name, normalized_query), 0) * 1.0
        )::REAL AS rank
    FROM public.product_contents pc
    WHERE pc.deleted_at IS NULL
      AND (
          to_tsvector('simple', coalesce(pc.name,'') || ' ' || coalesce(pc.short_description,'')) 
          @@ plainto_tsquery('simple', normalized_query)
          OR pc.name % normalized_query
      )
    
    UNION ALL
    
    -- Search articles
    SELECT 
        la.id,
        'article'::TEXT AS type,
        la.title,
        '/learn/' || la.category || '/' || la.slug AS slug,
        LEFT(la.excerpt, 120) AS excerpt,
        (
            COALESCE(ts_rank(to_tsvector('simple', la.title || ' ' || coalesce(la.excerpt,'')), 
                plainto_tsquery('simple', normalized_query)), 0) * 2.0 +
            COALESCE(similarity(la.title, normalized_query), 0) * 1.0
        )::REAL AS rank
    FROM public.learn_articles la
    WHERE la.is_published = true
      AND la.deleted_at IS NULL
      AND (
          to_tsvector('simple', coalesce(la.title,'') || ' ' || coalesce(la.excerpt,''))
          @@ plainto_tsquery('simple', normalized_query)
          OR la.title % normalized_query
      )
    
    UNION ALL
    
    -- Search solutions
    SELECT 
        s.id,
        'solution'::TEXT AS type,
        s.title,
        '/solutions/' || s.slug AS slug,
        LEFT(s.pain_point, 120) AS excerpt,
        (
            COALESCE(ts_rank(to_tsvector('simple', s.title || ' ' || coalesce(s.pain_point,'')),
                plainto_tsquery('simple', normalized_query)), 0) * 2.0 +
            COALESCE(similarity(s.title, normalized_query), 0) * 1.0
        )::REAL AS rank
    FROM public.solutions s
    WHERE s.is_published = true
      AND (
          to_tsvector('simple', coalesce(s.title,'') || ' ' || coalesce(s.pain_point,''))
          @@ plainto_tsquery('simple', normalized_query)
          OR s.title % normalized_query
      )
    
    ORDER BY rank DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- 5. Auto-update updated_at trigger (production-safe syntax)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers using DO block (avoids IF NOT EXISTS which doesn't work for triggers)
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY['members', 'orders', 'tickets', 'reviews', 'cart_items', 
                           'product_contents', 'learn_articles', 'solutions', 'product_bundles'];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        BEGIN
            EXECUTE format(
                'CREATE TRIGGER trg_%I_updated_at 
                 BEFORE UPDATE ON public.%I 
                 FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
                tbl, tbl
            );
        EXCEPTION WHEN duplicate_object THEN
            -- Trigger already exists, skip
            NULL;
        END;
    END LOOP;
END $$;

-- 6. Enqueue job helper
CREATE OR REPLACE FUNCTION public.enqueue_job(
    p_queue_name TEXT,
    p_payload JSONB,
    p_available_at TIMESTAMPTZ DEFAULT now(),
    p_max_attempts INTEGER DEFAULT 3
)
RETURNS BIGINT AS $$
DECLARE
    v_job_id BIGINT;
BEGIN
    INSERT INTO public.job_queue (queue_name, payload, available_at, max_attempts)
    VALUES (p_queue_name, p_payload, p_available_at, p_max_attempts)
    RETURNING id INTO v_job_id;
    
    RETURN v_job_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Reserve job helper (for worker)
CREATE OR REPLACE FUNCTION public.reserve_jobs(
    p_queue_name TEXT,
    p_limit INTEGER DEFAULT 10,
    p_timeout INTEGER DEFAULT 300
)
RETURNS TABLE (
    job_id BIGINT,
    job_payload JSONB,
    job_attempts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    UPDATE public.job_queue jq
    SET 
        status = 'processing',
        reserved_at = now(),
        attempts = attempts + 1
    WHERE jq.id IN (
        SELECT subq.id
        FROM public.job_queue subq
        WHERE subq.queue_name = p_queue_name
          AND subq.status = 'pending'
          AND subq.attempts < subq.max_attempts
          AND subq.available_at <= now()
        ORDER BY subq.created_at ASC
        LIMIT p_limit
        FOR UPDATE SKIP LOCKED
    )
    RETURNING jq.id, jq.payload, jq.attempts;
END;
$$ LANGUAGE plpgsql;

-- 8. Complete job helper
CREATE OR REPLACE FUNCTION public.complete_job(p_job_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE public.job_queue
    SET status = 'completed', completed_at = now()
    WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Fail job helper
CREATE OR REPLACE FUNCTION public.fail_job(p_job_id BIGINT, p_error TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.job_queue
    SET 
        status = CASE 
            WHEN attempts >= max_attempts THEN 'failed'::job_status 
            ELSE 'pending'::job_status 
        END,
        error_message = p_error,
        reserved_at = NULL
    WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Log audit entry helper
CREATE OR REPLACE FUNCTION public.log_audit(
    p_user_id UUID,
    p_user_role TEXT,
    p_action TEXT,
    p_resource TEXT,
    p_resource_id TEXT,
    p_changes JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    v_id BIGINT;
BEGIN
    INSERT INTO public.audit_log (
        user_id, user_role, action, resource, resource_id,
        changes, ip_address, user_agent, session_id
    ) VALUES (
        p_user_id, p_user_role, p_action, p_resource, p_resource_id,
        p_changes, p_ip_address, p_user_agent, p_session_id
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;
