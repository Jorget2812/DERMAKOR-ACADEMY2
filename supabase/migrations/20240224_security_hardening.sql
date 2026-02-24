-- ============================================
-- MIGRACIÓN: security_hardening_is_admin_rpcs
-- Fecha: 2024-02-23
-- Descripción: Unificación is_admin + blindado EXECUTE RPCs
-- ============================================

BEGIN;

-- ============================================
-- SECCIÓN 1: UNIFICACIÓN is_admin()
-- ============================================

-- 1.1 Crear la función canónica is_admin() sin parámetros.
-- Esta función es la única fuente de verdad para verificar si el usuario actual es ADMIN.
-- Se define con SECURITY DEFINER para que pueda consultar la tabla 'profiles' independientemente del RLS del usuario.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'ADMIN'
  );
$$;

-- 1.2 Actualizar el RPC create_order_secure para usar la nueva firma.
-- Antes usaba: public.is_admin(v_user_id).
-- Ahora usa public.is_admin() y valida que auth.uid() coincida con el v_user_id del contexto.
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
    -- 1. Validar Usuario
    SELECT level, status, verification_status INTO v_level, v_status, v_v_status
    FROM public.profiles WHERE id = v_user_id;

    -- Usamos la firma unificada is_admin()
    IF v_user_id IS NULL OR v_status != 'ACTIVE' OR (v_v_status != 'APPROVED' AND NOT public.is_admin()) THEN
        RAISE EXCEPTION 'Utilisateur non autorisé ou inactif';
    END IF;

    -- 2. Validar Dirección (Suiza únicamente)
    IF p_shipping_address->>'country' != 'CH' THEN
        RAISE EXCEPTION 'Livraison únicamente disponible en Suisse (CH)';
    END IF;

    -- 3. Crear cabecera de la orden
    INSERT INTO public.orders (user_id, status, currency, total_base_cents, total_discount_cents, total_final_cents, shipping_address, billing_address, vat_total_cents)
    VALUES (v_user_id, 'PENDING', 'CHF', 0, 0, 0, p_shipping_address, p_billing_address, 0)
    RETURNING id INTO v_order_id;

    -- 4. Procesar items
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
        IF v_p_pricing.stock_count < v_item.qty THEN RAISE EXCEPTION 'Stock insuffisant'; END IF;

        DECLARE
            v_net_unit INTEGER := (round(v_p_pricing.base_price_cents / v_p_pricing.active_factor))::INTEGER;
            v_vat_rate NUMERIC := CASE WHEN v_level = 'NONE' THEN 0.081 ELSE 0 END;
            v_vat_amt INTEGER := CASE WHEN v_level = 'NONE' THEN (round(v_net_unit * 0.081))::INTEGER ELSE 0 END;
            v_gross_unit INTEGER := v_net_unit + v_vat_amt;
            v_line_total INTEGER := v_gross_unit * v_item.qty;
        BEGIN
            INSERT INTO public.order_items (
                order_id, variant_id, qty, 
                base_unit_price_cents, retail_unit_price_cents, resale_factor_used,
                net_unit_price_cents, vat_rate, vat_amount_cents, gross_unit_price_cents, line_total_cents
            ) VALUES (
                v_order_id, v_item.variant_id, v_item.qty,
                v_net_unit, v_p_pricing.base_price_cents, v_p_pricing.active_factor,
                v_net_unit, v_vat_rate, v_vat_amt, v_gross_unit, v_line_total
            );

            v_total_base := v_total_base + (v_p_pricing.base_price_cents * v_item.qty);
            v_total_discount := v_total_discount + ((v_p_pricing.base_price_cents - v_net_unit) * v_item.qty);
            v_vat_total := v_vat_total + (v_vat_amt * v_item.qty);
            v_total_final := v_total_final + v_line_total;
        END;
    END LOOP;

    -- 5. Finalizar cabecera
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

-- 1.3 Eliminar la firma antigua de is_admin(uuid) para evitar duplicidad.
DROP FUNCTION IF EXISTS public.is_admin(uuid);


-- ============================================
-- SECCIÓN 2: BLINDADO DE RPCs SENSIBLES
-- Permisos: Solo authenticated + service_role
-- ============================================

-- create_order_secure
REVOKE EXECUTE ON FUNCTION public.create_order_secure(jsonb, jsonb, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_order_secure(jsonb, jsonb, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_order_secure(jsonb, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_secure(jsonb, jsonb, jsonb) TO service_role;

-- get_products_with_pricing
REVOKE EXECUTE ON FUNCTION public.get_products_with_pricing() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_products_with_pricing() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_products_with_pricing() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_products_with_pricing() TO service_role;

-- get_resale_factor
REVOKE EXECUTE ON FUNCTION public.get_resale_factor(public.user_level, uuid, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_resale_factor(public.user_level, uuid, uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_resale_factor(public.user_level, uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_resale_factor(public.user_level, uuid, uuid, text) TO service_role;

-- mark_order_paid (Si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'mark_order_paid') THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.mark_order_paid(uuid) FROM PUBLIC';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.mark_order_paid(uuid) FROM anon';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.mark_order_paid(uuid) TO authenticated';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.mark_order_paid(uuid) TO service_role';
    END IF;
END $$;

-- cancel_order (Si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cancel_order') THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.cancel_order(uuid) FROM PUBLIC';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.cancel_order(uuid) FROM anon';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.cancel_order(uuid) TO authenticated';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.cancel_order(uuid) TO service_role';
    END IF;
END $$;

-- decrement_stock_safe (Si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'decrement_stock_safe') THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.decrement_stock_safe(uuid, integer) FROM PUBLIC';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.decrement_stock_safe(uuid, integer) FROM anon';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.decrement_stock_safe(uuid, integer) TO authenticated';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.decrement_stock_safe(uuid, integer) TO service_role';
    END IF;
END $$;


-- ============================================
-- SECCIÓN 3: BLINDADO DE RPCs PÚBLICAS
-- Permisos: anon + authenticated + service_role
-- ============================================

-- list_products_public (Si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'list_products_public') THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.list_products_public() FROM PUBLIC';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.list_products_public() TO anon';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.list_products_public() TO authenticated';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.list_products_public() TO service_role';
    END IF;
END $$;

-- get_product_public (Si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_product_public') THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_product_public(text) FROM PUBLIC';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.get_product_public(text) TO anon';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.get_product_public(text) TO authenticated';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.get_product_public(text) TO service_role';
    END IF;
END $$;


-- ============================================
-- SECCIÓN 4: VERIFICACIONES (ejecutar manualmente post-deploy)
-- ============================================

/*
-- VERIFICACIÓN 1: Confirmar que solo existe una firma de is_admin
SELECT routine_name, specific_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name = 'is_admin';
-- Esperado: 1 sola fila (sin parámetros)

-- VERIFICACIÓN 2: Confirmar permisos de RPCs sensibles
SELECT routine_name, grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name IN (
  'create_order_secure',
  'get_products_with_pricing', 
  'mark_order_paid',
  'decrement_stock_safe'
)
ORDER BY routine_name, grantee;
-- Esperado: NO debe aparecer 'anon' ni 'PUBLIC' en estas funciones

-- VERIFICACIÓN 3: Confirmar is_admin funciona para admin real
-- Ejecutar como usuario admin → debe retornar true
-- SELECT public.is_admin();
*/

COMMIT;
