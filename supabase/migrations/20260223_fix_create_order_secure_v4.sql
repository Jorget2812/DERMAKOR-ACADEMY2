-- ============================================
-- MIGRACIÓN: 20260223_fix_create_order_secure_v4.sql
-- Objetivo: Resolver BUGS críticos en create_order_secure (v4)
--           y añadir cancel_order para flujo Stripe.
-- ============================================

BEGIN;

-- 1. Función para cancelar órdenes huérfanas o fallidas
CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Solo cancelamos si está PENDING para evitar errores con órdenes pagadas
    UPDATE public.orders 
    SET status = 'CANCELLED' 
    WHERE id = p_order_id AND status = 'PENDING';
END;
$$;

-- 2. Refuerzo de create_order_secure
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
    
    -- Variables para items
    v_net_unit INTEGER;
    v_vat_rate NUMERIC;
    v_vat_amt INTEGER;
    v_gross_unit INTEGER;
    v_line_total INTEGER;
BEGIN
    -- 1. Obtención de datos del perfil
    SELECT level, status, verification_status 
    INTO v_level, v_status, v_v_status
    FROM public.profiles WHERE id = v_user_id;

    -- Validación de usuario completa
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Non authentifié';
    END IF;

    IF NOT public.is_admin() THEN
        IF v_status != 'ACTIVE' THEN
            RAISE EXCEPTION 'Compte suspendu';
        END IF;
        IF v_v_status != 'APPROVED' THEN
            RAISE EXCEPTION 'Compte non approuvé';
        END IF;
    END IF;

    -- 2. Validar Dirección (Suiza únicamente)
    IF p_shipping_address->>'country' != 'CH' THEN
        RAISE EXCEPTION 'Livraison uniquement disponible en Suisse (CH)';
    END IF;

    -- 3. Crear cabecera de la orden (PENDING)
    INSERT INTO public.orders (
        user_id, status, currency, 
        total_base_cents, total_discount_cents, vat_total_cents, total_final_cents,
        shipping_address, billing_address
    )
    VALUES (
        v_user_id, 'PENDING', 'CHF', 
        0, 0, 0, 0, 
        p_shipping_address, p_billing_address
    )
    RETURNING id INTO v_order_id;

    -- 4. Procesar Items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, qty INTEGER) LOOP
        -- Lock para validación de stock
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
            -- Corrección: Firma exacta de get_resale_factor
            SELECT public.get_resale_factor(
                v_level,       -- p_level
                p.id,          -- p_product_id
                p.category_id, -- p_category_id
                v_month        -- p_month (TEXT)
            ) as factor
        ) f
        WHERE v.id = v_item.variant_id AND v.active = TRUE AND p.active = TRUE
        FOR UPDATE OF v;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variante introuvable ou inactive';
        END IF;

        IF v_p_pricing.stock_count < v_item.qty THEN
            RAISE EXCEPTION 'Stock insuffisant para variante %', v_item.variant_id;
        END IF;

        -- Cálculos financieros
        v_net_unit := (round(v_p_pricing.base_price_cents / v_p_pricing.active_factor))::INTEGER;
        v_vat_rate := CASE WHEN v_level = 'NONE' THEN 0.081 ELSE 0 END;
        v_vat_amt := CASE WHEN v_level = 'NONE' THEN (round(v_net_unit * 0.081))::INTEGER ELSE 0 END;
        v_gross_unit := v_net_unit + v_vat_amt;
        v_line_total := v_gross_unit * v_item.qty;

        -- Corrección INSERT: base y retail snapshots
        INSERT INTO public.order_items (
            order_id, variant_id, qty, 
            base_unit_price_cents,      -- Precio marcado (retail)
            retail_unit_price_cents,    -- Precio marcado (snapshot)
            resale_factor_used,        -- Factor de reventa
            net_unit_price_cents,      -- Neto calculado
            vat_rate, vat_amount_cents, gross_unit_price_cents, line_total_cents
        ) VALUES (
            v_order_id, v_item.variant_id, v_item.qty,
            v_p_pricing.base_price_cents,
            v_p_pricing.base_price_cents,
            v_p_pricing.active_factor,
            v_net_unit,
            v_vat_rate, v_vat_amt, v_gross_unit, v_line_total
        );

        -- Acumular totales
        v_total_base := v_total_base + (v_p_pricing.base_price_cents * v_item.qty);
        v_total_discount := v_total_discount + ((v_p_pricing.base_price_cents - v_net_unit) * v_item.qty);
        v_vat_total := v_vat_total + (v_vat_amt * v_item.qty);
        v_total_final := v_total_final + v_line_total;

    END LOOP;

    -- 5. Finalizar cabecera con totales y número de factura
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

-- Permisos
GRANT EXECUTE ON FUNCTION public.create_order_secure(JSONB, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_secure(JSONB, JSONB, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.cancel_order(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_order(UUID) TO service_role;

COMMIT;
