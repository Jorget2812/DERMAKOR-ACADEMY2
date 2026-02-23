-- DERMAKOR ACADEMY - ADMIN AUTHORIZATION STANDARDIZATION
-- Standardizing is_admin() calls across the system

BEGIN;

-------------------------------------------------------------------------------
-- 1. Standardized Admin Functions
-------------------------------------------------------------------------------

-- 1.1 Parameterized version: checks specific UID in admin_users table
CREATE OR REPLACE FUNCTION public.is_admin(p_uid UUID) 
RETURNS boolean 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users WHERE user_id = p_uid
    );
END;
$$;

-- 1.2 Parameterless version: helper for current authenticated user
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean 
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
    RETURN public.is_admin(auth.uid());
END;
$$;

-- Ensure permissions
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-------------------------------------------------------------------------------
-- 2. Update Existing Pricing Engine Functions
-------------------------------------------------------------------------------

-- 2.1 Update get_products_with_pricing
-- Dropping first to handle possible signature changes cleanly (though signature is the same)
DROP FUNCTION IF EXISTS public.get_products_with_pricing();
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
    base_price_cents INTEGER,
    resale_factor NUMERIC,
    discount_percent INTEGER,
    net_price_cents INTEGER,
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
    SELECT level, status, verification_status 
    INTO v_level, v_status, v_v_status
    FROM public.profiles WHERE id = v_user_id;

    -- Standardized Admin Check (Parameterless)
    IF (v_user_id IS NULL OR v_status != 'ACTIVE' OR v_v_status != 'APPROVED') AND NOT public.is_admin() THEN
        RETURN;
    END IF;

    IF v_level IS NULL THEN v_level := 'NONE'; END IF;

    RETURN QUERY
    SELECT 
        p.id, v.id, p.name, v.sku, p.slug, p.category_id, to_jsonb(p.images), p.description,
        v.base_price_cents as retail,
        f.factor,
        (round((1.0 - (1.0 / f.factor)) * 100))::INTEGER as disc,
        (round(v.base_price_cents / f.factor))::INTEGER as net,
        (CASE WHEN v_level = 'NONE' THEN 0.081 ELSE 0 END)::NUMERIC as v_rate,
        (CASE WHEN v_level = 'NONE' THEN round(round(v.base_price_cents / f.factor) * 0.081) ELSE 0 END)::INTEGER as v_amt,
        (CASE WHEN v_level = 'NONE' THEN round(round(v.base_price_cents / f.factor) * 1.081) ELSE round(v.base_price_cents / f.factor) END)::INTEGER as gross,
        v.stock_count
    FROM public.products p
    JOIN public.product_variants v ON v.product_id = p.id
    CROSS JOIN LATERAL (
        SELECT public.get_resale_factor(v_level, p.id, p.category_id, v_month) as factor
    ) f
    WHERE p.active = TRUE AND v.active = TRUE;
END;
$$;

-- 2.2 Update create_order_secure
DROP FUNCTION IF EXISTS public.create_order_secure(jsonb, jsonb, jsonb);
CREATE OR REPLACE FUNCTION public.create_order_secure(
    p_shipping_address JSONB,
    p_billing_address JSONB,
    p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_order_id UUID;
    v_level public.user_level;
    v_status public.user_status;
    v_v_status public.verification_status;
    v_item RECORD;
    v_total_base INTEGER := 0;
    v_total_discount INTEGER := 0;
    v_vat_total INTEGER := 0;
    v_total_final INTEGER := 0;
    v_month TEXT := to_char(now(), 'YYYY-MM');
    v_p_pricing RECORD;
    v_invoice_num TEXT;
BEGIN
    SELECT level, status, verification_status INTO v_level, v_status, v_v_status
    FROM public.profiles WHERE id = v_user_id;

    -- Standardized Admin Check (Parameterless)
    IF v_user_id IS NULL OR v_status != 'ACTIVE' OR (v_v_status != 'APPROVED' AND NOT public.is_admin()) THEN
        RAISE EXCEPTION 'Utilisateur non autorisé ou inactif';
    END IF;

    IF p_shipping_address->>'country' != 'CH' THEN
        RAISE EXCEPTION 'Livraison uniquement disponible en Suisse (CH)';
    END IF;

    INSERT INTO public.orders (user_id, status, currency, total_base_cents, total_discount_cents, total_final_cents, shipping_address, billing_address, vat_total_cents)
    VALUES (v_user_id, 'PENDING', 'CHF', 0, 0, 0, p_shipping_address, p_billing_address, 0)
    RETURNING id INTO v_order_id;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, qty INTEGER) LOOP
        SELECT 
            v.base_price_cents,
            v.stock_count,
            p.id as product_id,
            p.category_id,
            f.factor as active_factor
        INTO v_p_pricing
        FROM public.product_variants v
        JOIN public.products p ON p.id = v.product_id
        CROSS JOIN LATERAL (
            SELECT public.get_resale_factor(v_level, p.id, p.category_id, v_month) as factor
        ) f
        WHERE v.id = v_item.variant_id AND v.active = TRUE AND p.active = TRUE
        FOR UPDATE OF v;

        IF NOT FOUND THEN RAISE EXCEPTION 'Variante introuvable ou inactive'; END IF;
        IF v_p_pricing.stock_count < v_item.qty THEN RAISE EXCEPTION 'Stock insuffisant para %', v_item.variant_id; END IF;

        DECLARE
            v_net_unit INTEGER := (round(v_p_pricing.base_price_cents / v_p_pricing.active_factor))::INTEGER;
            v_vat_rate NUMERIC := CASE WHEN v_level = 'NONE' THEN 0.081 ELSE 0 END;
            v_vat_amt INTEGER := CASE WHEN v_level = 'NONE' THEN (round(v_net_unit * 0.081))::INTEGER ELSE 0 END;
            v_gross_unit INTEGER := v_net_unit + v_vat_amt;
            v_line_total INTEGER := v_gross_unit * v_item.qty;
        BEGIN
            INSERT INTO public.order_items (
                order_id, variant_id, qty, 
                base_unit_price_cents, 
                retail_unit_price_cents, 
                resale_factor_used, 
                discount_percent,
                net_unit_price_cents,
                vat_rate, vat_amount_cents, gross_unit_price_cents, line_total_cents
            ) VALUES (
                v_order_id, v_item.variant_id, v_item.qty,
                v_net_unit,
                v_p_pricing.base_price_cents,
                v_p_pricing.active_factor,
                (round((1.0 - (1.0 / v_p_pricing.active_factor)) * 100))::INTEGER,
                v_net_unit,
                v_vat_rate, v_vat_amt, v_gross_unit, v_line_total
            );

            v_total_base := v_total_base + (v_p_pricing.base_price_cents * v_item.qty);
            v_total_discount := v_total_discount + ((v_p_pricing.base_price_cents - v_net_unit) * v_item.qty);
            v_vat_total := v_vat_total + (v_vat_amt * v_item.qty);
            v_total_final := v_total_final + v_line_total;

            UPDATE public.product_variants SET stock_count = stock_count - v_item.qty WHERE id = v_item.variant_id;
        END;
    END LOOP;

    SELECT 'INV-' || to_char(now(), 'YYYY') || '-' || LPAD(nextval('public.order_invoice_seq')::TEXT, 5, '0') INTO v_invoice_num;
    
    UPDATE public.orders SET
        total_base_cents = v_total_base,
        total_discount_cents = v_total_discount,
        vat_total_cents = v_vat_total,
        total_final_cents = v_total_final,
        invoice_number = v_invoice_num
    WHERE id = v_order_id;

    RETURN v_order_id;
END;
$$;

-------------------------------------------------------------------------------
-- 3. Update RLS Policies
-------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can do everything on pricing rules" ON public.pricing_pro_rules;
CREATE POLICY "Admins can do everything on pricing rules" 
ON public.pricing_pro_rules 
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full control" ON public.pricing_pro_rules;
CREATE POLICY "Admin full control" ON public.pricing_pro_rules 
FOR ALL 
USING (public.is_admin());

COMMIT;
