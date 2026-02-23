-- DERMAKOR ACADEMY - HOTFIX: total_discount_cents NOT NULL constraint
-- This migration fixes the checkout crash by ensuring total_discount_cents is never NULL.

BEGIN;

-- 1. Hardening: Set default and update existing NULLs
UPDATE public.orders SET total_discount_cents = 0 WHERE total_discount_cents IS NULL;
ALTER TABLE public.orders ALTER COLUMN total_discount_cents SET DEFAULT 0;

-- 2. Update RPC create_order_secure to handle the column explicitly
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

    -- Include total_discount_cents in initial insert as 0
    INSERT INTO public.orders (
        user_id, status, currency, 
        shipping_address, billing_address,
        total_discount_cents, total_base_cents, total_final_cents, vat_total_cents
    )
    VALUES (
        v_user_id, 'PENDING', 'CHF', 
        p_shipping_address, p_billing_address,
        0, 0, 0, 0
    )
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

            v_total_base := v_total_base + (v_p_pricing.base_price_cents * v_item.qty);
            v_vat_total := v_vat_total + (v_vat * v_item.qty);
            v_total_final := v_total_final + (v_gross * v_item.qty);
        END;
    END LOOP;

    SELECT 'INV-' || to_char(now(), 'YYYY') || '-' || LPAD(nextval('public.order_invoice_seq')::TEXT, 5, '0') INTO v_invoice_num;
    
    -- Final update including the calculated total_discount_cents
    UPDATE public.orders SET
        total_base_cents = v_total_base,
        vat_total_cents = v_vat_total,
        total_final_cents = v_total_final,
        total_discount_cents = (v_total_base - (v_total_final - v_vat_total)),
        invoice_number = v_invoice_num
    WHERE id = v_order_id;

    RETURN v_order_id;
END;
$$;

COMMIT;
