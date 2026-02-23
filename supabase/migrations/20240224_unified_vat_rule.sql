-- DERMAKOR ACADEMY - UNIFIED VAT UPDATE
-- RULE: All user tiers (NONE, STANDARD, PREMIUM) now pay 8.1% VAT.
-- This ensures B2C and B2B orders include the required tax in Switzerland.

BEGIN;

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

    -- 2. Validate Address
    IF p_shipping_address->>'country' != 'CH' THEN
        RAISE EXCEPTION 'Livraison uniquement disponible en Suisse (CH)';
    END IF;

    -- 3. Create Order Header
    INSERT INTO public.orders (user_id, status, currency, total_base_cents, total_discount_cents, total_final_cents, shipping_address, billing_address, vat_total_cents)
    VALUES (v_user_id, 'PENDING', 'CHF', 0, 0, 0, p_shipping_address, p_billing_address, 0)
    RETURNING id INTO v_order_id;

    -- 4. Process Items
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

        IF NOT FOUND THEN RAISE EXCEPTION 'Variante introuvable'; END IF;
        IF v_p_pricing.stock_count < v_item.qty THEN RAISE EXCEPTION 'Stock insuffisant'; END IF;

        DECLARE
            -- Net unit is the base divided by factor
            v_net_unit INTEGER := (round(v_p_pricing.base_price_cents / v_p_pricing.active_factor))::INTEGER;
            
            -- NEW RULE: Unified 8.1% VAT for everyone
            v_vat_rate NUMERIC := 0.081;
            v_vat_amt INTEGER := (round(v_net_unit * 0.081))::INTEGER;
            
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

COMMIT;
