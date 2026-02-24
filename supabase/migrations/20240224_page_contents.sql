-- 20240224_page_contents.sql
-- Generic page content table for the CMS editor in admin

CREATE TABLE IF NOT EXISTS public.page_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT NOT NULL,        -- 'home', 'about', 'academy-info'
    field_key  TEXT NOT NULL,        -- 'hero_title', 'hero_subtitle', 'cta_primary'
    field_value TEXT,
    locale TEXT DEFAULT 'fr' CHECK (locale IN ('fr', 'it', 'de')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(page_slug, field_key, locale)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_page_contents_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_page_contents_updated_at ON public.page_contents;
CREATE TRIGGER trg_page_contents_updated_at
BEFORE UPDATE ON public.page_contents
FOR EACH ROW EXECUTE FUNCTION public.update_page_contents_updated_at();

-- RLS
ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
DROP POLICY IF EXISTS "Admin full access to page_contents" ON public.page_contents;
CREATE POLICY "Admin full access to page_contents"
ON public.page_contents
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Public (anon) can only read
DROP POLICY IF EXISTS "Public read page_contents" ON public.page_contents;
CREATE POLICY "Public read page_contents"
ON public.page_contents
FOR SELECT
TO anon, authenticated
USING (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_page_contents_slug ON public.page_contents(page_slug, locale);
