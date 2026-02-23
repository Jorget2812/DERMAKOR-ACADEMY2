-- 20240224_cms_setup.sql
 
-- 1. Create product_badges table
CREATE TABLE IF NOT EXISTS public.product_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    level public.user_level NOT NULL,
    locale TEXT NOT NULL CHECK (locale IN ('fr', 'it', 'de')),
    badge_text TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(product_id, level, locale)
);
 
-- RLS for product_badges
ALTER TABLE public.product_badges ENABLE ROW LEVEL SECURITY;
 
DROP POLICY IF EXISTS "Admin full access to product_badges" ON public.product_badges;
CREATE POLICY "Admin full access to product_badges"
ON public.product_badges
FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
 
DROP POLICY IF EXISTS "Verified users read product_badges" ON public.product_badges;
CREATE POLICY "Verified users read product_badges"
ON public.product_badges
FOR SELECT
TO authenticated
USING (
    public.is_admin(auth.uid()) OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND verification_status = 'APPROVED' 
        AND status = 'ACTIVE'
    )
);
 
-- 2. Create dashboard_settings table
CREATE TABLE IF NOT EXISTS public.dashboard_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level public.user_level NOT NULL,
    locale TEXT NOT NULL CHECK (locale IN ('fr', 'it', 'de')),
    enabled BOOLEAN NOT NULL DEFAULT true,
    -- HERO
    hero_title TEXT,
    hero_body TEXT,
    hero_cta_label TEXT,
    hero_cta_href TEXT,
    -- CARD 1
    card1_title TEXT,
    card1_body TEXT,
    card1_icon TEXT, 
    card1_cta_label TEXT,
    card1_cta_href TEXT,
    -- CARD 2
    card2_title TEXT,
    card2_body TEXT,
    card2_icon TEXT,
    card2_cta_label TEXT,
    card2_cta_href TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(level, locale)
);
 
-- RLS for dashboard_settings
ALTER TABLE public.dashboard_settings ENABLE ROW LEVEL SECURITY;
 
DROP POLICY IF EXISTS "Admin full access to dashboard_settings" ON public.dashboard_settings;
CREATE POLICY "Admin full access to dashboard_settings"
ON public.dashboard_settings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
 
DROP POLICY IF EXISTS "Verified users read dashboard_settings" ON public.dashboard_settings;
CREATE POLICY "Verified users read dashboard_settings"
ON public.dashboard_settings
FOR SELECT
TO authenticated
USING (
    public.is_admin(auth.uid()) OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND verification_status = 'APPROVED' 
        AND status = 'ACTIVE'
    )
);
 
-- 3. Audit Logs Setup (Ensure table exists)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
 
-- Index for unique lookups
CREATE INDEX IF NOT EXISTS idx_product_badges_lookup ON public.product_badges(product_id, level, locale);
CREATE INDEX IF NOT EXISTS idx_dashboard_settings_lookup ON public.dashboard_settings(level, locale);
