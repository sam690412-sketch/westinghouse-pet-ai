-- Restore the storefront's content schema without inserting or rewriting content.
BEGIN;

CREATE TABLE IF NOT EXISTS public.solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    pain_point TEXT,
    audience TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    recommended_products TEXT[] DEFAULT '{}',
    meta_title TEXT,
    meta_description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- The standalone storefront database does not depend on the old members table.
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID,
    product_id UUID REFERENCES public.product_contents(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    images TEXT[] DEFAULT '{}',
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.learn_articles
    ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
    ADD COLUMN IF NOT EXISTS author TEXT,
    ADD COLUMN IF NOT EXISTS read_time TEXT;

ALTER TABLE public.reviews
    ADD COLUMN IF NOT EXISTS author_name TEXT,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS product_sku TEXT,
    ADD COLUMN IF NOT EXISTS product_slug TEXT,
    ADD COLUMN IF NOT EXISTS verified BOOLEAN,
    ADD COLUMN IF NOT EXISTS helpful_count INTEGER;

ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

COMMIT;
