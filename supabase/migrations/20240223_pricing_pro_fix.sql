-- PHASE 3.1: FIX PRICING RPC (ADD MISSING FIELDS)

DROP FUNCTION IF EXISTS public.get_products_with_pricing();

CREATE OR REPLACE FUNCTION public.get_products_with_pricing()
RETURNS TABLE (
    product_id UUID,
    variant_id UUID,
    name TEXT,
    sku TEXT,
    slug TEXT,               -- Missing
    category_id UUID,        -- Missing
    images JSONB,            -- Missing (stored as images ARRAY or JSONB in products?)
    base_price_cents INTEGER,
    resale_factor NUMERIC,
    discount_percent INTEGER, -- Added back for compatibility
    net_price_cents INTEGER,
    vat_rate NUMERIC,
    vat_amount_cents INTEGER,
    gross_price_cents INTEGER,
    stock_count INTEGER,
    description TEXT         -- Optional but useful
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

    -- Authorization check
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
