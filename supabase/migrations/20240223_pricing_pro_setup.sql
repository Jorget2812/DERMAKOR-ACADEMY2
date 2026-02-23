-- PHASE 1: PRICING PRO DATABASE SETUP

-- 1. Create pricing_scope enum
DO $$ BEGIN
    CREATE TYPE public.pricing_scope AS ENUM ('GLOBAL', 'CATEGORY', 'PRODUCT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create pricing_pro_rules table
CREATE TABLE IF NOT EXISTS public.pricing_pro_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_month TEXT NOT NULL, -- Format 'YYYY-MM'
    level public.user_level NOT NULL,
    scope public.pricing_scope NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    resale_factor NUMERIC NOT NULL CHECK (resale_factor >= 1.0 AND resale_factor <= 5.0),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Scope validation constraints
    CONSTRAINT check_scope_consistency CHECK (
        (scope = 'GLOBAL' AND category_id IS NULL AND product_id IS NULL) OR
        (scope = 'CATEGORY' AND category_id IS NOT NULL AND product_id IS NULL) OR
        (scope = 'PRODUCT' AND product_id IS NOT NULL)
    ),
    
    -- Prevent duplicate active rules for the same target
    CONSTRAINT unique_active_rule UNIQUE(year_month, level, scope, category_id, product_id)
);

-- 3. Add audit columns to order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS retail_unit_price_cents INTEGER;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS resale_factor_used NUMERIC;

-- 4. Enable RLS on pricing_pro_rules
ALTER TABLE public.pricing_pro_rules ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Only admins can manage, authenticated can read
DROP POLICY IF EXISTS "Admins can do everything on pricing rules" ON public.pricing_pro_rules;
CREATE POLICY "Admins can do everything on pricing rules" 
ON public.pricing_pro_rules 
FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read active pricing rules" ON public.pricing_pro_rules;
CREATE POLICY "Authenticated users can read active pricing rules" 
ON public.pricing_pro_rules 
FOR SELECT 
TO authenticated 
USING (active = true);

-- 6. Seed initial rules (Standard Homecare and Global Premium)
DO $$
DECLARE
    v_homecare_id UUID;
    v_current_month TEXT := to_char(now(), 'YYYY-MM');
BEGIN
    -- Find Homecare category
    SELECT id INTO v_homecare_id FROM public.categories WHERE slug = 'homecare' OR name ILIKE '%homecare%' LIMIT 1;
    
    IF v_homecare_id IS NOT NULL THEN
        INSERT INTO public.pricing_pro_rules (year_month, level, scope, category_id, resale_factor)
        VALUES (v_current_month, 'STANDARD', 'CATEGORY', v_homecare_id, 2.5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Global rule for Premium (default factor 2.0)
    INSERT INTO public.pricing_pro_rules (year_month, level, scope, resale_factor)
    VALUES (v_current_month, 'PREMIUM', 'GLOBAL', 2.0)
    ON CONFLICT DO NOTHING;
END $$;
