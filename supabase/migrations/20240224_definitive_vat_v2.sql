-- DERMAKOR ACADEMY - DEFINITIVE VAT LOGIC V2
-- RULES:
-- 1. NONE Users: base_price_cents is TTC (Gross). Net is derived backwards (base / 1.081).
-- 2. PRO Users (STANDARD/PREMIUM): base_price_cents is RETAIL_NET. Net = round(retail / factor). Gross = net + 8.1% VAT.

BEGIN;

-- 1. Update Pricing Engine (Shop/PDP)
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
    base_price_cents INTEGER, -- This remains the retail reference from variant row
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

    IF (v_user_id IS NULL OR v_status != 'ACTIVE' OR v_v_status != 'APPROVED') AND NOT public.is_admin(v_user_id) THEN
        RETURN;
    END IF;

    IF v_level IS NULL THEN v_level := 'NONE'; END IF;

    RETURN QUERY
    SELECT 
        p.id, v.id, p.name, v.sku, p.slug, p.category_id, to_jsonb(p.images), p.description,
        v.base_price_cents,
        f.factor,
        (round((1.0 - (1.0 / f.factor)) * 100))::INTEGER as disc,
        -- Logic split
        CASE 
            WHEN v_level = 'NONE' THEN (round(v.base_price_cents / 1.081))::INTEGER -- NONE: base is gross
            ELSE (round(v.base_price_cents / f.factor))::INTEGER -- PRO: base is retail_net
        END as net,
        (0.081)::NUMERIC as v_rate,
        CASE 
            WHEN v_level = 'NONE' THEN (v.base_price_cents - (round(v.base_price_cents / 1.081))::INTEGER) -- NONE: gross - net
            ELSE (round((round(v.base_price_cents / f.factor)) * 0.081))::INTEGER -- PRO: net * 0.081
        END as v_amt,
        CASE 
            WHEN v_level = 'NONE' THEN v.base_price_cents -- NONE: literal gross
            ELSE ((round(v.base_price_cents / f.factor))::INTEGER + (round((round(v.base_price_cents / f.factor)) * 0.081))::INTEGER) -- PRO: net + vat
        END as gross,
        v.stock_count
    FROM public.products p
    JOIN public.product_variants v ON v.product_id = p.id
    CROSS JOIN LATERAL (
        SELECT public.get_resale_factor(v_level, p.id, p.category_id, v_month) as factor
    ) f
    WHERE v.active = TRUE AND p.active = TRUE;
END;
$$;

-- 2. Update Order Secure (Checkout)
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
    v_item RECORD;
    v_total_base INTEGER := 0;
    v_vat_total INTEGER := 0;
    v_total_final INTEGER := 0;
    v_month TEXT := to_char(now(), 'YYYY-MM');
    v_p_pricing RECORD;
    v_invoice_num TEXT;
BEGIN
    SELECT level, status INTO v_level, v_status
    FROM public.profiles WHERE id = v_user_id;

    IF v_user_id IS NULL OR v_status != 'ACTIVE' THEN
        RAISE EXCEPTION 'Utilisateur non autorisé';
    END IF;

    INSERT INTO public.orders (user_id, status, currency, shipping_address, billing_address)
    VALUES (v_user_id, 'PENDING', 'CHF', p_shipping_address, p_billing_address)
    RETURNING id INTO v_order_id;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, qty INTEGER) LOOP
        SELECT v.base_price_cents, p.id as p_id, p.category_id as c_id, f.factor
        INTO v_p_pricing
        FROM public.product_variants v
        JOIN public.products p ON p.id = v.product_id
        CROSS JOIN LATERAL (SELECT public.get_resale_factor(v_level, p.id, p.category_id, v_month) as factor) f
        WHERE v.id = v_item.variant_id AND v.active = TRUE;

        IF NOT FOUND THEN RAISE EXCEPTION 'Produit non disponible'; END IF;

        DECLARE
            v_net INTEGER;
            v_vat INTEGER;
            v_gross INTEGER;
        BEGIN
            IF v_level = 'NONE' THEN
                v_gross := v_p_pricing.base_price_cents;
                v_net := (round(v_gross / 1.081))::INTEGER;
                v_vat := v_gross - v_net;
            ELSE
                v_net := (round(v_p_pricing.base_price_cents / v_p_pricing.factor))::INTEGER;
                v_vat := (round(v_net * 0.081))::INTEGER;
                v_gross := v_net + v_vat;
            END IF;

            INSERT INTO public.order_items (
                order_id, variant_id, qty, 
                base_unit_price_cents, retail_unit_price_cents, resale_factor_used,
                net_unit_price_cents, vat_rate, vat_amount_cents, gross_unit_price_cents, line_total_cents
            ) VALUES (
                v_order_id, v_item.variant_id, v_item.qty,
                v_net, v_p_pricing.base_price_cents, v_p_pricing.factor,
                v_net, 0.081, v_vat, v_gross, v_gross * v_item.qty
            );

            v_total_base := v_total_base + (v_net * v_item.qty);
            v_vat_total := v_vat_total + (v_vat * v_item.qty);
            v_total_final := v_total_final + (v_gross * v_item.qty);
        END;
    END LOOP;

    SELECT 'INV-' || to_char(now(), 'YYYY') || '-' || LPAD(nextval('public.order_invoice_seq')::TEXT, 5, '0') INTO v_invoice_num;
    UPDATE public.orders SET
        total_base_cents = v_total_base,
        vat_total_cents = v_vat_total,
        total_final_cents = v_total_final,
        invoice_number = v_invoice_num
    WHERE id = v_order_id;

    RETURN v_order_id;
END;
$$;

COMMIT;
