-- ============================================================
-- SHIPPING SYSTEM MIGRATION — DermaKor Swiss
-- Exécuter dans Supabase SQL Editor (en une seule fois)
-- ============================================================

-- ============================================================
-- 1. Ajouter poids aux variantes de produits
-- ============================================================
ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS weight_grams INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.product_variants.weight_grams IS 'Poids du produit en grammes. Utilisé pour calculer le tarif de livraison.';


-- ============================================================
-- 2. Créer la table des tarifs de livraison
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shipping_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method TEXT NOT NULL CHECK (method IN ('STANDARD', 'EXPRESS')),
    label_fr TEXT NOT NULL,
    label_de TEXT,
    label_it TEXT,
    weight_min_grams INTEGER NOT NULL,
    weight_max_grams INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    estimated_days_min INTEGER NOT NULL,
    estimated_days_max INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT shipping_rates_valid_range CHECK (weight_min_grams < weight_max_grams),
    CONSTRAINT shipping_rates_positive_price CHECK (price_cents >= 0)
);

CREATE INDEX IF NOT EXISTS idx_shipping_rates_method_weight
ON public.shipping_rates (method, weight_min_grams, weight_max_grams)
WHERE active = TRUE;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_shipping_rates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_shipping_rates_updated ON public.shipping_rates;
CREATE TRIGGER trg_shipping_rates_updated
BEFORE UPDATE ON public.shipping_rates
FOR EACH ROW EXECUTE FUNCTION update_shipping_rates_timestamp();


-- ============================================================
-- 3. RLS pour shipping_rates
-- ============================================================
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shipping_rates_public_select" ON public.shipping_rates;
DROP POLICY IF EXISTS "shipping_rates_admin_all" ON public.shipping_rates;

-- Tous peuvent lire les tarifs actifs
CREATE POLICY "shipping_rates_public_select" ON public.shipping_rates
    FOR SELECT USING (active = TRUE OR public.is_admin());

-- Seul admin peut modifier
CREATE POLICY "shipping_rates_admin_all" ON public.shipping_rates
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- ============================================================
-- 4. Seed: Tarifs initiaux
-- ============================================================
INSERT INTO public.shipping_rates (method, label_fr, label_de, label_it, weight_min_grams, weight_max_grams, price_cents, estimated_days_min, estimated_days_max, sort_order)
VALUES
-- STANDARD — 3-5 jours ouvrables
('STANDARD', 'Livraison Standard (3-5 jours ouvrables)', 'Standardlieferung (3-5 Werktage)', 'Consegna Standard (3-5 giorni lavorativi)', 1, 2000, 1500, 3, 5, 1),
('STANDARD', 'Livraison Standard (3-5 jours ouvrables)', 'Standardlieferung (3-5 Werktage)', 'Consegna Standard (3-5 giorni lavorativi)', 2001, 10000, 3500, 3, 5, 2),
('STANDARD', 'Livraison Standard (3-5 jours ouvrables)', 'Standardlieferung (3-5 Werktage)', 'Consegna Standard (3-5 giorni lavorativi)', 10001, 30000, 15000, 3, 5, 3),
-- EXPRESS — 24h
('EXPRESS', 'Livraison Express (24h)', 'Expresslieferung (24h)', 'Consegna Express (24h)', 1, 2000, 2500, 1, 1, 4),
('EXPRESS', 'Livraison Express (24h)', 'Expresslieferung (24h)', 'Consegna Express (24h)', 2001, 10000, 5000, 1, 1, 5),
('EXPRESS', 'Livraison Express (24h)', 'Expresslieferung (24h)', 'Consegna Express (24h)', 10001, 30000, 25000, 1, 1, 6)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 5. Ajouter colonnes shipping à orders
-- ============================================================
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_method TEXT,
ADD COLUMN IF NOT EXISTS shipping_price_cents INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_weight_grams INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_estimated_days TEXT;


-- ============================================================
-- 6. RPC get_shipping_rate
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_shipping_rate(
    p_weight_grams INTEGER,
    p_method TEXT DEFAULT 'STANDARD'
)
RETURNS TABLE (
    id UUID,
    method TEXT,
    label_fr TEXT,
    label_de TEXT,
    label_it TEXT,
    price_cents INTEGER,
    estimated_days_min INTEGER,
    estimated_days_max INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sr.id,
        sr.method,
        sr.label_fr,
        sr.label_de,
        sr.label_it,
        sr.price_cents,
        sr.estimated_days_min,
        sr.estimated_days_max
    FROM public.shipping_rates sr
    WHERE sr.method = p_method
      AND sr.active = TRUE
      AND p_weight_grams >= sr.weight_min_grams
      AND p_weight_grams <= sr.weight_max_grams
    ORDER BY sr.sort_order
    LIMIT 1;
END;
$$;


-- ============================================================
-- 7. Mettre à jour create_order_secure avec shipping
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_order_secure(
    p_shipping_address JSONB,
    p_billing_address JSONB,
    p_items JSONB,
    p_shipping_method TEXT DEFAULT 'STANDARD'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
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
    v_total_weight INTEGER := 0;
    v_shipping_price INTEGER := 0;
    v_shipping_days TEXT := '';
    v_month TEXT := to_char(now(), 'YYYY-MM');
    v_p_pricing RECORD;
    v_invoice_num TEXT;
    v_net_unit INTEGER;
    v_vat_amt INTEGER;
    v_gross_unit INTEGER;
    v_line_total INTEGER;
BEGIN
    -- 1. Auth check
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Non authentifié'; END IF;

    SELECT level, status, verification_status
    INTO v_level, v_status, v_v_status
    FROM public.profiles WHERE id = v_user_id;

    IF NOT public.is_admin() THEN
        IF v_status != 'ACTIVE' THEN RAISE EXCEPTION 'Compte suspendu'; END IF;
        IF v_v_status != 'APPROVED' THEN RAISE EXCEPTION 'Compte non approuvé'; END IF;
    END IF;

    -- 2. Validation adresse
    IF (p_shipping_address->>'country') != 'CH' THEN
        RAISE EXCEPTION 'Livraison uniquement disponible en Suisse (CH)';
    END IF;

    -- 3. Calculer poids total
    SELECT COALESCE(SUM(pv.weight_grams * (x.qty)::INTEGER), 0)
    INTO v_total_weight
    FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, qty INTEGER)
    JOIN public.product_variants pv ON pv.id = x.variant_id;

    -- Poids minimum si 0 (produits sans poids configuré)
    IF v_total_weight = 0 THEN
        v_total_weight := 1;
    END IF;

    -- 4. Obtenir tarif de livraison
    SELECT sr.price_cents,
           (sr.estimated_days_min || '-' || sr.estimated_days_max || ' jours ouvrables')
    INTO v_shipping_price, v_shipping_days
    FROM public.shipping_rates sr
    WHERE sr.method = p_shipping_method
      AND sr.active = TRUE
      AND v_total_weight >= sr.weight_min_grams
      AND v_total_weight <= sr.weight_max_grams
    ORDER BY sr.sort_order
    LIMIT 1;

    IF v_shipping_price IS NULL THEN
        -- Fallback: tarif le plus proche si poids hors plage
        SELECT sr.price_cents,
               (sr.estimated_days_min || '-' || sr.estimated_days_max || ' jours ouvrables')
        INTO v_shipping_price, v_shipping_days
        FROM public.shipping_rates sr
        WHERE sr.method = p_shipping_method AND sr.active = TRUE
        ORDER BY sr.weight_max_grams DESC
        LIMIT 1;
    END IF;

    IF v_shipping_price IS NULL THEN
        RAISE EXCEPTION 'Aucun tarif de livraison disponible pour la méthode %', p_shipping_method;
    END IF;

    -- 5. Créer l'en-tête de commande
    INSERT INTO public.orders (
        user_id, status, currency,
        total_base_cents, total_discount_cents, vat_total_cents, total_final_cents,
        shipping_address, billing_address,
        shipping_method, shipping_price_cents, shipping_weight_grams, shipping_estimated_days
    )
    VALUES (
        v_user_id, 'PENDING', 'CHF',
        0, 0, 0, 0,
        p_shipping_address, p_billing_address,
        p_shipping_method, v_shipping_price, v_total_weight, v_shipping_days
    )
    RETURNING id INTO v_order_id;

    -- 6. Traiter les articles
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

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variante introuvable ou inactive: %', v_item.variant_id;
        END IF;

        IF v_p_pricing.stock_count < v_item.qty THEN
            RAISE EXCEPTION 'Stock insuffisant pour la variante %', v_item.variant_id;
        END IF;

        -- Calcul prix (TVA 8.1% pour TOUS)
        v_net_unit   := ROUND(v_p_pricing.base_price_cents / v_p_pricing.active_factor)::INTEGER;
        v_vat_amt    := ROUND(v_net_unit * 0.081)::INTEGER;
        v_gross_unit := v_net_unit + v_vat_amt;
        v_line_total := v_gross_unit * v_item.qty;

        INSERT INTO public.order_items (
            order_id, variant_id, qty,
            base_unit_price_cents,
            retail_unit_price_cents,
            resale_factor_used,
            net_unit_price_cents,
            vat_rate, vat_amount_cents, gross_unit_price_cents, line_total_cents
        ) VALUES (
            v_order_id, v_item.variant_id, v_item.qty,
            v_p_pricing.base_price_cents,
            v_p_pricing.base_price_cents,
            v_p_pricing.active_factor,
            v_net_unit,
            0.081, v_vat_amt, v_gross_unit, v_line_total
        );

        v_total_base     := v_total_base     + (v_net_unit * v_item.qty);
        v_total_discount := v_total_discount + ((v_p_pricing.base_price_cents - v_net_unit) * v_item.qty);
        v_vat_total      := v_vat_total      + (v_vat_amt * v_item.qty);
        v_total_final    := v_total_final    + v_line_total;

        UPDATE public.product_variants
        SET stock_count = stock_count - v_item.qty
        WHERE id = v_item.variant_id;
    END LOOP;

    -- 7. Ajouter livraison au total (SANS TVA)
    v_total_final := v_total_final + v_shipping_price;

    -- 8. Générer numéro de facture et finaliser
    BEGIN
        SELECT 'INV-' || to_char(now(), 'YYYY') || '-' || LPAD(nextval('public.order_invoice_seq')::TEXT, 5, '0')
        INTO v_invoice_num;
    EXCEPTION WHEN undefined_object THEN
        v_invoice_num := 'INV-' || to_char(now(), 'YYYY') || '-' || UPPER(SUBSTRING(v_order_id::TEXT, 1, 6));
    END;

    UPDATE public.orders SET
        total_base_cents     = v_total_base,
        total_discount_cents = v_total_discount,
        vat_total_cents      = v_vat_total,
        total_final_cents    = v_total_final,
        invoice_number       = v_invoice_num
    WHERE id = v_order_id;

    RETURN v_order_id;
END;
$$;

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT 'shipping_rates' AS table_name, COUNT(*) AS row_count FROM public.shipping_rates
UNION ALL
SELECT 'shipping columns in orders', COUNT(*) FROM information_schema.columns
WHERE table_name = 'orders' AND column_name IN ('shipping_method', 'shipping_price_cents', 'shipping_weight_grams', 'shipping_estimated_days')
UNION ALL
SELECT 'weight_grams in product_variants', COUNT(*) FROM information_schema.columns
WHERE table_name = 'product_variants' AND column_name = 'weight_grams';
