-- FINAL PRICING PRO FIX & SEED

-- 1. Drop existing function to update legacy signature
DROP FUNCTION IF EXISTS public.get_products_with_pricing();

-- 2. Corrected RPC with ALL required fields for the UI
CREATE OR REPLACE FUNCTION public.get_products_with_pricing()
RETURNS TABLE (
    product_id UUID,
    variant_id UUID,
    name TEXT,
    sku TEXT,
    slug TEXT,
    category_id UUID,
    images JSONB,
    base_price_cents INTEGER,
    resale_factor NUMERIC,
    discount_percent INTEGER,
    net_price_cents INTEGER,
    vat_rate NUMERIC,
    vat_amount_cents INTEGER,
    gross_price_cents INTEGER,
    stock_count INTEGER,
    description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_level public.user_level;
    v_status public.user_status;
    v_v_status public.verification_status;
    v_month TEXT := to_char(now(), 'YYYY-MM');
BEGIN
    SELECT level, status, verification_status 
    INTO v_level, v_status, v_v_status
    FROM public.profiles WHERE id = v_user_id;

    IF (v_user_id IS NULL OR v_status != 'ACTIVE' OR v_v_status != 'APPROVED') AND NOT public.is_admin(v_user_id) THEN
        RETURN;
    END IF;

    IF v_level IS NULL THEN v_level := 'NONE'; END IF;

    RETURN QUERY
    SELECT 
        p.id as product_id, 
        v.id as variant_id, 
        p.name, 
        v.sku,
        p.slug,
        p.category_id,
        to_jsonb(p.images) as images,
        v.base_price_cents,
        f.factor as resale_factor,
        (round((1.0 - (1.0 / f.factor)) * 100.0))::INTEGER as discount_percent,
        (round(v.base_price_cents / f.factor))::INTEGER as net,
        CASE WHEN v_level = 'NONE' THEN 0.081 ELSE 0 END::NUMERIC as v_rate,
        CASE 
            WHEN v_level = 'NONE' THEN (round(v.base_price_cents * 0.081))::INTEGER 
            ELSE 0 
        END as v_amt,
        CASE 
            WHEN v_level = 'NONE' THEN (round(v.base_price_cents * 1.081))::INTEGER 
            ELSE (round(v.base_price_cents / f.factor))::INTEGER 
        END as gross,
        v.stock_count,
        p.description
    FROM public.products p
    JOIN public.product_variants v ON v.product_id = p.id
    CROSS JOIN LATERAL (
        SELECT public.get_resale_factor(v_level, p.id, p.category_id, v_month) as factor
    ) f
    WHERE p.active = TRUE AND v.active = TRUE;
END;
$$;

-- 3. Initial Data Seeding for the Current Month
DO $$
DECLARE
    v_homecare_id UUID;
    v_current_month TEXT := to_char(now(), 'YYYY-MM');
BEGIN
    -- Find Homecare category
    SELECT id INTO v_homecare_id FROM public.categories WHERE slug = 'homecare' OR name ILIKE '%homecare%' LIMIT 1;
    
    IF v_homecare_id IS NOT NULL THEN
        -- Standard Rule: 2.5x Homecare
        INSERT INTO public.pricing_pro_rules (year_month, level, scope, category_id, resale_factor)
        VALUES (v_current_month, 'STANDARD', 'CATEGORY', v_homecare_id, 2.5)
        ON CONFLICT (year_month, level, scope, category_id, product_id) DO UPDATE SET resale_factor = 2.5;
    END IF;

    -- Premium Rule: 2.0x Global Default
    INSERT INTO public.pricing_pro_rules (year_month, level, scope, resale_factor)
    VALUES (v_current_month, 'PREMIUM', 'GLOBAL', 2.0)
    ON CONFLICT (year_month, level, scope, category_id, product_id) DO UPDATE SET resale_factor = 2.0;
END $$;
