-- SQL Migration: Add images to pricing RPC
-- Run this in Supabase SQL Editor

DROP FUNCTION IF EXISTS public.get_products_with_pricing();

CREATE OR REPLACE FUNCTION public.get_products_with_pricing()
RETURNS TABLE (
    product_id UUID,
    variant_id UUID,
    name TEXT,
    sku TEXT,
    base_price_cents INTEGER,
    discount_percent INTEGER,
    net_price_cents INTEGER,
    vat_rate NUMERIC,
    vat_amount_cents INTEGER,
    gross_price_cents INTEGER,
    stock_count INTEGER,
    category_id UUID,
    images TEXT[],
    slug TEXT,
    description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_level public.user_level;
    v_status public.user_status;
    v_v_status public.verification_status;
    v_month TEXT := to_char(now(), 'YYYY-MM');
BEGIN
    v_user_id := auth.uid();
    
    SELECT level, status, verification_status 
    INTO v_level, v_status, v_v_status
    FROM public.profiles 
    WHERE id = v_user_id;

    -- Return nothing if not approved professional or admin
    IF (v_user_id IS NULL OR v_status != 'ACTIVE' OR v_v_status != 'APPROVED') AND NOT public.is_admin(v_user_id) THEN
        RETURN;
    END IF;

    -- Default to NONE level logic if admin is just browsing
    IF v_level IS NULL THEN v_level := 'NONE'; END IF;

    RETURN QUERY
    SELECT 
        p.id, v.id as v_id, p.name, v.sku, v.base_price_cents,
        COALESCE(cd.percent, md.percent, 0) as disc_pct,
        (round(v.base_price_cents * (100 - COALESCE(cd.percent, md.percent, 0)) / 100.0))::INTEGER as net,
        CASE WHEN v_level = 'NONE' THEN 0.081 ELSE 0 END::NUMERIC as v_rate,
        CASE 
            WHEN v_level = 'NONE' THEN (round(round(v.base_price_cents * (100 - COALESCE(cd.percent, md.percent, 0)) / 100.0) * 0.081))::INTEGER 
            ELSE 0 
        END as v_amt,
        CASE 
            WHEN v_level = 'NONE' THEN (round(round(v.base_price_cents * (100 - COALESCE(cd.percent, md.percent, 0)) / 100.0) * 1.081))::INTEGER 
            ELSE (round(v.base_price_cents * (100 - COALESCE(cd.percent, md.percent, 0)) / 100.0))::INTEGER 
        END as gross,
        v.stock_count,
        p.category_id,
        p.images,
        p.slug,
        p.description
    FROM public.products p
    JOIN public.product_variants v ON v.product_id = p.id
    LEFT JOIN public.monthly_discounts md ON md.year_month = v_month AND md.level = v_level
    LEFT JOIN public.category_discounts cd ON cd.year_month = v_month AND cd.level = v_level AND cd.category_id = p.category_id
    WHERE p.active = TRUE AND v.active = TRUE;
END;
$$;
