-- DERMAKOR ACADEMY - UNIFIED VAT PRICING UPDATE
-- RULE: All user tiers pay 8.1% VAT on all products.

BEGIN;

CREATE OR REPLACE FUNCTION public.get_products_with_pricing()
RETURNS TABLE (
    product_id UUID,
    variant_id UUID,
    name TEXT,
    sku TEXT,
    slug TEXT,
    category_id UUID,
    images JSONB,
    description TEXT,
    base_price_cents INTEGER, -- RETAIL PRICE
    resale_factor NUMERIC,     -- FACTOR USED
    discount_percent INTEGER,  -- UI ONLY REMISE %
    net_price_cents INTEGER,   -- round(base / factor)
    vat_rate NUMERIC,
    vat_amount_cents INTEGER,
    gross_price_cents INTEGER,
    stock_count INTEGER
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
    -- 1. Security Check
    SELECT level, status, verification_status 
    INTO v_level, v_status, v_v_status
    FROM public.profiles WHERE id = v_user_id;

    IF (v_user_id IS NULL OR v_status != 'ACTIVE' OR v_v_status != 'APPROVED') AND NOT public.is_admin(v_user_id) THEN
        RETURN;
    END IF;

    IF v_level IS NULL THEN v_level := 'NONE'; END IF;

    -- 2. Query with Logic (Enforce 8.1% VAT for all)
    RETURN QUERY
    SELECT 
        p.id, v.id, p.name, v.sku, p.slug, p.category_id, to_jsonb(p.images), p.description,
        v.base_price_cents as retail,
        f.factor,
        (round((1.0 - (1.0 / f.factor)) * 100))::INTEGER as disc,
        (round(v.base_price_cents / f.factor))::INTEGER as net,
        (0.081)::NUMERIC as v_rate, -- FIXED 8.1%
        (round((round(v.base_price_cents / f.factor)) * 0.081))::INTEGER as v_amt,
        (round((round(v.base_price_cents / f.factor)) * 1.081))::INTEGER as gross,
        v.stock_count
    FROM public.products p
    JOIN public.product_variants v ON v.product_id = p.id
    CROSS JOIN LATERAL (
        SELECT public.get_resale_factor(v_level, p.id, p.category_id, v_month) as factor
    ) f
    WHERE v.active = TRUE AND p.active = TRUE;
END;
$$;

COMMIT;
