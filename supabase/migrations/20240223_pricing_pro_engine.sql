-- PHASE 3 & 4: PRICING PRO ENGINE & SECURE ORDERING

-- Drop existing functions to handle signature changes (RETURNS TABLE structure)
DROP FUNCTION IF EXISTS public.get_products_with_pricing();
DROP FUNCTION IF EXISTS public.create_order_secure(jsonb, jsonb, jsonb);

-------------------------------------------------------------------------------
-- 1. Helper Function to get active resale factor
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_resale_factor(
    p_user_level public.user_level,
    p_product_id UUID,
    p_category_id UUID,
    p_month TEXT DEFAULT to_char(now(), 'YYYY-MM')
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_factor NUMERIC := 1.0;
    v_is_homecare BOOLEAN := FALSE;
BEGIN
    -- 1. Handle NONE level (Public)
    IF p_user_level = 'NONE' THEN
        RETURN 1.0;
    END IF;

    -- 2. Handle STANDARD level (Fixed Business Rules)
    IF p_user_level = 'STANDARD' THEN
        -- Check if category is Homecare
        SELECT (slug = 'homecare' OR name ILIKE '%homecare%') INTO v_is_homecare
        FROM public.categories WHERE id = p_category_id;
        
        IF v_is_homecare THEN
            RETURN 2.5; -- Standard partners get 2.5x factor on Homecare
        ELSE
            RETURN 1.0; -- 1.0 on everything else
        END IF;
    END IF;

    -- 3. Handle PREMIUM level (Dynamic Rules with Precedence)
    IF p_user_level = 'PREMIUM' THEN
        -- Precedence: PRODUCT > CATEGORY > GLOBAL
        SELECT resale_factor INTO v_factor
        FROM public.pricing_pro_rules
        WHERE active = true 
          AND level = 'PREMIUM' 
          AND year_month = p_month
          AND (
              (scope = 'PRODUCT' AND product_id = p_product_id) OR
              (scope = 'CATEGORY' AND category_id = p_category_id) OR
              (scope = 'GLOBAL')
          )
        ORDER BY 
            CASE scope
                WHEN 'PRODUCT' THEN 1
                WHEN 'CATEGORY' THEN 2
                WHEN 'GLOBAL' THEN 3
            END ASC
        LIMIT 1;

        RETURN COALESCE(v_factor, 1.0);
    END IF;

    RETURN 1.0;
END;
$$;

-------------------------------------------------------------------------------
-- 2. Update get_products_with_pricing (Phase 3)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_products_with_pricing()
RETURNS TABLE (
    product_id UUID,
    variant_id UUID,
    name TEXT,
    sku TEXT,
    base_price_cents INTEGER,
    resale_factor NUMERIC, -- New column
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

    -- Authorization check
    IF (v_user_id IS NULL OR v_status != 'ACTIVE' OR v_v_status != 'APPROVED') AND NOT public.is_admin(v_user_id) THEN
        RETURN;
    END IF;

    IF v_level IS NULL THEN v_level := 'NONE'; END IF;

    RETURN QUERY
    SELECT 
        p.id, v.id as v_id, p.name, v.sku, v.base_price_cents,
        f.factor,
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
        v.stock_count
    FROM public.products p
    JOIN public.product_variants v ON v.product_id = p.id
    CROSS JOIN LATERAL (
        SELECT public.get_resale_factor(v_level, p.id, p.category_id, v_month) as factor
    ) f
    WHERE p.active = TRUE AND v.active = TRUE;
END;
$$;

-------------------------------------------------------------------------------
-- 3. Update create_order_secure (Phase 4)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_order_secure(
    p_shipping_address JSONB,
    p_billing_address JSONB,
    p_items JSONB -- [{variant_id, qty}]
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
    v_vat_total INTEGER := 0;
    v_total_final INTEGER := 0;
    v_month TEXT := to_char(now(), 'YYYY-MM');
    v_p_pricing RECORD;
    v_invoice_num TEXT;
BEGIN
    -- 1. Get user info
    SELECT level, status, verification_status INTO v_level, v_status, v_v_status
    FROM public.profiles WHERE id = v_user_id;

    IF v_user_id IS NULL OR v_status != 'ACTIVE' OR (v_v_status != 'APPROVED' AND NOT public.is_admin(v_user_id)) THEN
        RAISE EXCEPTION 'Utilisateur non autorisé ou inactif';
    END IF;

    -- 2. Create Order Header (Initial)
    INSERT INTO public.orders (user_id, status, total_base_cents, total_discount_cents, total_final_cents, shipping_address, billing_address, vat_total_cents)
    VALUES (v_user_id, 'PENDING', 0, 0, 0, p_shipping_address, p_billing_address, 0)
    RETURNING id INTO v_order_id;

    -- 3. Process Items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, qty INTEGER) LOOP
        -- Get pricing and check stock atomically
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

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variante introuvable où inactive: %', v_item.variant_id;
        END IF;

        IF v_p_pricing.stock_count < v_item.qty THEN
            RAISE EXCEPTION 'Stock insuffisant pour la variante: %', v_item.variant_id;
        END IF;

        -- Calculations
        DECLARE
            v_net_unit INTEGER := (round(v_p_pricing.base_price_cents / v_p_pricing.active_factor))::INTEGER;
            v_vat_rate NUMERIC := CASE WHEN v_level = 'NONE' THEN 0.081 ELSE 0 END;
            v_vat_amt INTEGER := CASE WHEN v_level = 'NONE' THEN (round(v_net_unit * 0.081))::INTEGER ELSE 0 END;
            v_gross_unit INTEGER := v_net_unit + v_vat_amt;
            v_line_total INTEGER := v_gross_unit * v_item.qty;
        BEGIN
            -- Insert item with Pricing Pro audit data
            INSERT INTO public.order_items (
                order_id, variant_id, qty, 
                base_unit_price_cents, 
                retail_unit_price_cents, -- New audit column
                resale_factor_used,      -- New audit column
                discount_percent,         -- Legacy (set to 0)
                net_unit_price_cents,
                vat_rate, vat_amount_cents, gross_unit_price_cents, line_total_cents
            ) VALUES (
                v_order_id, v_item.variant_id, v_item.qty,
                v_net_unit, -- Current effective net
                v_p_pricing.base_price_cents, -- Original Retail
                v_p_pricing.active_factor,    -- Factor used
                0, -- No more simple discount percent
                v_net_unit,
                v_vat_rate, v_vat_amt, v_gross_unit, v_line_total
            );

            -- Accumulate totals
            v_total_base := v_total_base + (v_p_pricing.base_price_cents * v_item.qty);
            v_vat_total := v_vat_total + (v_vat_amt * v_item.qty);
            v_total_final := v_total_final + v_line_total;

            -- 4. Decrement Stock
            UPDATE public.product_variants SET stock_count = stock_count - v_item.qty WHERE id = v_item.variant_id;
        END;
    END LOOP;

    -- 5. Update Order Header with Totals and Generate Invoice Number
    SELECT 'INV-' || to_char(now(), 'YYYY') || '-' || LPAD(nextval('public.order_invoice_seq')::TEXT, 5, '0') INTO v_invoice_num;

    UPDATE public.orders SET
        total_base_cents = v_total_base,
        total_discount_cents = (v_total_base - (v_total_final - v_vat_total)),
        vat_total_cents = v_vat_total,
        total_final_cents = v_total_final,
        status = 'PENDING',
        invoice_number = v_invoice_num
    WHERE id = v_order_id;

    RETURN v_order_id;
END;
$$;
