-- DERMAKOR ACADEMY - PRICING PRO HARDENED ENGINE (V2)
-- Implementing strict OPUS requirements:
-- Formula: Net = round(Retail / Factor)
-- Precedence: PRODUCT > CATEGORY > GLOBAL
-- STANDARD Level: Default 1.0, Homecare 2.5
-- PREMIUM Level: Dynamic Factors (1.5-2.0)
-- VAT: NONE Level only (8.1% on Net)

BEGIN;

-------------------------------------------------------------------------------
-- 1. SETUP DE BASE
-------------------------------------------------------------------------------

-- 1.1 Scope Enum
DO $$ BEGIN
    CREATE TYPE public.pricing_scope AS ENUM ('GLOBAL', 'CATEGORY', 'PRODUCT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1.2 Pricing Pro Rules Table
CREATE TABLE IF NOT EXISTS public.pricing_pro_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_month TEXT NOT NULL, -- YYYY-MM
    level public.user_level NOT NULL CHECK (level IN ('STANDARD', 'PREMIUM')),
    scope public.pricing_scope NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    resale_factor NUMERIC NOT NULL CHECK (resale_factor >= 1.0 AND resale_factor <= 5.0),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Consistency constraints
    CONSTRAINT check_scope_validity CHECK (
        (scope = 'GLOBAL' AND category_id IS NULL AND product_id IS NULL) OR
        (scope = 'CATEGORY' AND category_id IS NOT NULL AND product_id IS NULL) OR
        (scope = 'PRODUCT' AND product_id IS NOT NULL)
    )
);

-- 1.3 Null-Safe Unique Index (Robust ON CONFLICT)
-- Using special UUID 0000... to replace NULLs in index
DROP INDEX IF EXISTS public.idx_pricing_unique_robust;
CREATE UNIQUE INDEX idx_pricing_unique_robust ON public.pricing_pro_rules (
    year_month, 
    level, 
    scope,
    (COALESCE(category_id, '00000000-0000-0000-0000-000000000000'::uuid)),
    (COALESCE(product_id,  '00000000-0000-0000-0000-000000000000'::uuid))
) WHERE active = true;

-- 1.4 Audit Columns for Order Items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS retail_unit_price_cents INTEGER;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS resale_factor_used NUMERIC;

-------------------------------------------------------------------------------
-- 2. ENGINE LOGIC (PRECEDENCE & CALCULATIONS)
-------------------------------------------------------------------------------

-- Drop existing functions to handle signature or parameter name changes
DROP FUNCTION IF EXISTS public.get_resale_factor(public.user_level, uuid, uuid, text);
DROP FUNCTION IF EXISTS public.get_products_with_pricing();
DROP FUNCTION IF EXISTS public.create_order_secure(jsonb, jsonb, jsonb);

-- 2.1 Helper: Get Resale Factor
CREATE OR REPLACE FUNCTION public.get_resale_factor(
    p_level public.user_level,
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
    -- NONE: Pays retail (factor 1.0)
    IF p_level = 'NONE' OR p_level IS NULL THEN
        RETURN 1.0;
    END IF;

    -- STANDARD: Fixed rules (Homecare 2.5)
    IF p_level = 'STANDARD' THEN
        -- Check if current product is Homecare
        SELECT (slug = 'homecare' OR name ILIKE '%homecare%') INTO v_is_homecare
        FROM public.categories WHERE id = p_category_id;
        
        -- Default for standard is factor 1.0, except Homecare category
        IF v_is_homecare THEN
            RETURN 2.5; 
        ELSE
            -- We also check for specific STANDARD rules if logic evolves, but default is 1.0
            SELECT resale_factor INTO v_factor
            FROM public.pricing_pro_rules
            WHERE active = true AND level = 'STANDARD' AND year_month = p_month
              AND ((scope = 'PRODUCT' AND product_id = p_product_id) OR (scope = 'CATEGORY' AND category_id = p_category_id) OR (scope = 'GLOBAL'))
            ORDER BY CASE scope WHEN 'PRODUCT' THEN 1 WHEN 'CATEGORY' THEN 2 WHEN 'GLOBAL' THEN 3 END ASC LIMIT 1;
            
            RETURN COALESCE(v_factor, 1.0);
        END IF;
    END IF;

    -- PREMIUM: Full precedence PRODUCT > CATEGORY > GLOBAL
    IF p_level = 'PREMIUM' THEN
        SELECT resale_factor INTO v_factor
        FROM public.pricing_pro_rules
        WHERE active = true AND level = 'PREMIUM' AND year_month = p_month
          AND ((scope = 'PRODUCT' AND product_id = p_product_id) OR (scope = 'CATEGORY' AND category_id = p_category_id) OR (scope = 'GLOBAL'))
        ORDER BY CASE scope WHEN 'PRODUCT' THEN 1 WHEN 'CATEGORY' THEN 2 WHEN 'GLOBAL' THEN 3 END ASC LIMIT 1;
        
        RETURN COALESCE(v_factor, 1.0);
    END IF;

    RETURN 1.0;
END;
$$;

-- 2.2 Core Product Pricing RPC (Hardened)
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
    base_price_cents INTEGER, -- RETAIL PRICE
    resale_factor NUMERIC,     -- FACTOR USED
    discount_percent INTEGER,  -- UI ONLY REMISE %
    net_price_cents INTEGER,   --round(base / factor)
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
    -- 1. Security Check: Session + Profile Status
    SELECT level, status, verification_status 
    INTO v_level, v_status, v_v_status
    FROM public.profiles WHERE id = v_user_id;

    IF (v_user_id IS NULL OR v_status != 'ACTIVE' OR v_v_status != 'APPROVED') AND NOT public.is_admin(v_user_id) THEN
        RETURN;
    END IF;

    -- Default if level somehow null
    IF v_level IS NULL THEN v_level := 'NONE'; END IF;

    -- 2. Query with Logic
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

-- Secure Permissions
REVOKE ALL ON FUNCTION public.get_products_with_pricing() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_products_with_pricing() TO authenticated;

-------------------------------------------------------------------------------
-- 3. SECURE CHECKOUT (SERVER-SIDE RE-CALCULATION)
-------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.create_order_secure(jsonb, jsonb, jsonb);
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
    v_total_discount INTEGER := 0;
    v_vat_total INTEGER := 0;
    v_total_final INTEGER := 0;
    v_month TEXT := to_char(now(), 'YYYY-MM');
    v_p_pricing RECORD;
    v_invoice_num TEXT;
BEGIN
    -- 1. Validate User
    SELECT level, status, verification_status INTO v_level, v_status, v_v_status
    FROM public.profiles WHERE id = v_user_id;

    IF v_user_id IS NULL OR v_status != 'ACTIVE' OR (v_v_status != 'APPROVED' AND NOT public.is_admin(v_user_id)) THEN
        RAISE EXCEPTION 'Utilisateur non autorisé ou inactif';
    END IF;

    -- 2. Validate Address (Strict Switzerland)
    IF p_shipping_address->>'country' != 'CH' THEN
        RAISE EXCEPTION 'Livraison uniquement disponible en Suisse (CH)';
    END IF;

    -- 3. Create Order Header
    INSERT INTO public.orders (user_id, status, currency, total_base_cents, total_discount_cents, total_final_cents, shipping_address, billing_address, vat_total_cents)
    VALUES (v_user_id, 'PENDING', 'CHF', 0, 0, 0, p_shipping_address, p_billing_address, 0)
    RETURNING id INTO v_order_id;

    -- 4. Process Items with Server-Side Recalculation
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, qty INTEGER) LOOP
        -- Atomic Fetch + Lock stock
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
        IF v_p_pricing.stock_count < v_item.qty THEN RAISE EXCEPTION 'Stock insuffisant pour %', v_item.variant_id; END IF;

        -- Calculations
        DECLARE
            v_net_unit INTEGER := (round(v_p_pricing.base_price_cents / v_p_pricing.active_factor))::INTEGER;
            v_vat_rate NUMERIC := CASE WHEN v_level = 'NONE' THEN 0.081 ELSE 0 END;
            v_vat_amt INTEGER := CASE WHEN v_level = 'NONE' THEN (round(v_net_unit * 0.081))::INTEGER ELSE 0 END;
            v_gross_unit INTEGER := v_net_unit + v_vat_amt;
            v_line_total INTEGER := v_gross_unit * v_item.qty;
        BEGIN
            -- Insert Item with Audit
            INSERT INTO public.order_items (
                order_id, variant_id, qty, 
                base_unit_price_cents, -- Current effective net
                retail_unit_price_cents, -- AUDIT: Marked price
                resale_factor_used,      -- AUDIT: Factor
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

            -- Accumulate
            v_total_base := v_total_base + (v_p_pricing.base_price_cents * v_item.qty);
            v_total_discount := v_total_discount + ((v_p_pricing.base_price_cents - v_net_unit) * v_item.qty);
            v_vat_total := v_vat_total + (v_vat_amt * v_item.qty);
            v_total_final := v_total_final + v_line_total;

            -- Decrement Stock (Actual subtraction)
            UPDATE public.product_variants SET stock_count = stock_count - v_item.qty WHERE id = v_item.variant_id;
        END;
    END LOOP;

    -- 5. Finalize Header
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
-- 4. RLS & SEEDS
-------------------------------------------------------------------------------

ALTER TABLE public.pricing_pro_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full control" ON public.pricing_pro_rules;
CREATE POLICY "Admin full control" ON public.pricing_pro_rules FOR ALL USING (public.is_admin(auth.uid()));

-- Seeds for current month
DO $$
DECLARE
    v_homecare_id UUID;
    v_current_month TEXT := to_char(now(), 'YYYY-MM');
BEGIN
    SELECT id INTO v_homecare_id FROM public.categories WHERE slug = 'homecare' OR name ILIKE '%homecare%' LIMIT 1;
    
    -- STANDARD Homecare (2.5)
    IF v_homecare_id IS NOT NULL THEN
        INSERT INTO public.pricing_pro_rules (year_month, level, scope, category_id, resale_factor)
        VALUES (v_current_month, 'STANDARD', 'CATEGORY', v_homecare_id, 2.5)
        ON CONFLICT (year_month, level, scope, (COALESCE(category_id, '00000000-0000-0000-0000-000000000000'::uuid)), (COALESCE(product_id, '00000000-0000-0000-0000-000000000000'::uuid))) 
        WHERE active = true
        DO UPDATE SET resale_factor = 2.5;
    END IF;

    -- PREMIUM Global (2.0)
    INSERT INTO public.pricing_pro_rules (year_month, level, scope, resale_factor)
    VALUES (v_current_month, 'PREMIUM', 'GLOBAL', 2.0)
    ON CONFLICT (year_month, level, scope, (COALESCE(category_id, '00000000-0000-0000-0000-000000000000'::uuid)), (COALESCE(product_id, '00000000-0000-0000-0000-000000000000'::uuid))) 
    WHERE active = true
    DO UPDATE SET resale_factor = 2.0;

END $$;

COMMIT;
