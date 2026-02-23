-- DERMAKOR ACADEMY - FINAL SECURITY-HARDENED SCHEMA

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS public;

-- 0. STORAGE
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', false) 
ON CONFLICT (id) DO NOTHING;

CREATE TYPE public.verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE public.user_status AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE public.user_level AS ENUM ('NONE', 'STANDARD', 'PREMIUM');
CREATE TYPE public.content_visibility AS ENUM ('STANDARD_ONLY', 'PREMIUM_ONLY', 'BOTH');
CREATE TYPE public.order_status AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');
CREATE TYPE public.visibility_override AS ENUM ('NORMAL', 'ADMIN_ONLY', 'HIDDEN');

-- 2. TABLES

-- Admin Users (Simple MVP Role management)
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  verification_status public.verification_status DEFAULT 'PENDING',
  status public.user_status DEFAULT 'ACTIVE',
  level public.user_level DEFAULT 'NONE',
  locale TEXT DEFAULT 'fr',
  phone_personal TEXT,
  phone_pro TEXT,
  company_name TEXT,
  ide_situation TEXT,
  expertise_domain TEXT,
  website TEXT,
  address_pro TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Requests
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_personal TEXT,
  company_name TEXT NOT NULL,
  ide_situation TEXT NOT NULL,
  phone_pro TEXT NOT NULL,
  expertise_domain TEXT NOT NULL,
  website TEXT,
  address_pro TEXT NOT NULL,
  message TEXT,
  status public.verification_status DEFAULT 'PENDING',
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Global Monthly Discounts
CREATE TABLE IF NOT EXISTS public.monthly_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_month TEXT NOT NULL, -- YYYY-MM
  level public.user_level NOT NULL,
  percent INTEGER NOT NULL,
  CONSTRAINT check_percent_limit CHECK (
    (level = 'STANDARD' AND percent <= 30) OR
    (level = 'PREMIUM' AND percent <= 50) OR
    (level = 'NONE' AND percent = 0)
  ),
  UNIQUE (year_month, level)
);

-- Category-specific Monthly Discounts
CREATE TABLE IF NOT EXISTS public.category_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_month TEXT NOT NULL,
  level public.user_level NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  percent INTEGER NOT NULL,
  CONSTRAINT check_cat_percent_limit CHECK (
    (level = 'STANDARD' AND percent <= 30) OR
    (level = 'PREMIUM' AND percent <= 50) OR
    (level = 'NONE' AND percent = 0)
  ),
  UNIQUE (year_month, level, category_id)
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  base_price_cents INTEGER NOT NULL, -- CHF
  stock_count INTEGER NOT NULL DEFAULT 0,
  attributes JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  CONSTRAINT check_stock_non_negative CHECK (stock_count >= 0)
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  status public.order_status DEFAULT 'PENDING',
  currency TEXT NOT NULL DEFAULT 'CHF' CHECK (currency = 'CHF'),
  total_base_cents INTEGER NOT NULL,
  total_discount_cents INTEGER NOT NULL,
  vat_total_cents INTEGER NOT NULL DEFAULT 0,
  total_final_cents INTEGER NOT NULL,
  shipping_cost_cents INTEGER DEFAULT 0,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  stripe_session_id TEXT UNIQUE,
  invoice_number TEXT UNIQUE,
  invoice_pdf_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_swiss_shipping CHECK (shipping_address->>'country' = 'CH')
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  base_unit_price_cents INTEGER NOT NULL,
  discount_percent INTEGER NOT NULL,
  net_unit_price_cents INTEGER NOT NULL,
  vat_rate NUMERIC(5,4) NOT NULL CHECK (vat_rate IN (0, 0.081)),
  vat_amount_cents INTEGER NOT NULL,
  gross_unit_price_cents INTEGER NOT NULL,
  line_total_cents INTEGER NOT NULL
);

-- Academy
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  visibility public.content_visibility DEFAULT 'BOTH',
  visibility_override public.visibility_override DEFAULT 'NORMAL',
  thumbnail_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  pdf_path TEXT,
  position INTEGER NOT NULL,
  visibility public.content_visibility DEFAULT 'BOTH',
  visibility_override public.visibility_override DEFAULT 'NORMAL'
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'STARTED',
  last_position_sec INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

-- Audit
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FUNCTIONS & RPC (SECURITY DEFINER)

-- Admin Check Function
CREATE OR REPLACE FUNCTION public.is_admin(p_uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_uid);
END;
$$;

-- Public Product List
CREATE OR REPLACE FUNCTION public.list_products_public()
RETURNS TABLE (
    id UUID,
    slug TEXT,
    name TEXT,
    description TEXT,
    category_id UUID,
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.slug, p.name, p.description, p.category_id, p.created_at
    FROM public.products p
    WHERE p.active = TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_products_public() TO anon, authenticated;

-- Public Product Detail
CREATE OR REPLACE FUNCTION public.get_product_public(p_slug TEXT)
RETURNS TABLE (
    id UUID,
    slug TEXT,
    name TEXT,
    description TEXT,
    category_id UUID,
    variants JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.slug, p.name, p.description, p.category_id,
        jsonb_agg(jsonb_build_object(
            'id', v.id,
            'sku', v.sku,
            'stock_count', v.stock_count,
            'attributes', v.attributes
        )) as variants
    FROM public.products p
    JOIN public.product_variants v ON v.product_id = p.id
    WHERE p.slug = p_slug AND p.active = TRUE AND v.active = TRUE
    GROUP BY p.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_product_public(TEXT) TO anon, authenticated;

-- Pricing for Verified Users with Precision Rounding
CREATE OR REPLACE FUNCTION public.get_products_with_pricing()
RETURNS TABLE (
    product_id UUID,
    variant_id UUID,
    name TEXT,
    sku TEXT,
    base_price_cents INTEGER,
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
    v_user_id UUID;
    v_level public.user_level;
    v_status public.user_status;
    v_v_status public.verification_status;
    v_month TEXT := to_char(now(), 'YYYY-MM');
BEGIN
    v_user_id := auth.uid();
    
    SELECT level, status, verification_status 
    INTO v_level, v_status, v_v_status
    FROM public.profiles 
    WHERE id = v_user_id;

    -- Return nothing if not approved professional or admin
    IF (v_user_id IS NULL OR v_status != 'ACTIVE' OR v_v_status != 'APPROVED') AND NOT public.is_admin(v_user_id) THEN
        RETURN;
    END IF;

    -- Default to NONE level logic if admin is just browsing (or handle admin specially)
    IF v_level IS NULL THEN v_level := 'NONE'; END IF;

    RETURN QUERY
    SELECT 
        p.id, v.id as v_id, p.name, v.sku, v.base_price_cents,
        COALESCE(cd.percent, md.percent, 0) as disc_pct,
        (round(v.base_price_cents * (100 - COALESCE(cd.percent, md.percent, 0)) / 100.0))::INTEGER as net,
        CASE WHEN v_level = 'NONE' THEN 0.081 ELSE 0 END::NUMERIC as v_rate,
        CASE 
            WHEN v_level = 'NONE' THEN (round(round(v.base_price_cents * (100 - COALESCE(cd.percent, md.percent, 0)) / 100.0) * 0.081))::INTEGER 
            ELSE 0 
        END as v_amt,
        CASE 
            WHEN v_level = 'NONE' THEN (round(round(v.base_price_cents * (100 - COALESCE(cd.percent, md.percent, 0)) / 100.0) * 1.081))::INTEGER 
            ELSE (round(v.base_price_cents * (100 - COALESCE(cd.percent, md.percent, 0)) / 100.0))::INTEGER 
        END as gross,
        v.stock_count
    FROM public.products p
    JOIN public.product_variants v ON v.product_id = p.id
    LEFT JOIN public.monthly_discounts md ON md.year_month = v_month AND md.level = v_level
    LEFT JOIN public.category_discounts cd ON cd.year_month = v_month AND cd.level = v_level AND cd.category_id = p.category_id
    WHERE p.active = TRUE AND v.active = TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_products_with_pricing() TO authenticated;

-- Atomic Stock Decrement
CREATE OR REPLACE FUNCTION public.decrement_stock_safe(p_variant_id UUID, p_qty INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.product_variants
    SET stock_count = stock_count - p_qty
    WHERE id = p_variant_id AND stock_count >= p_qty;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_stock_safe(UUID, INTEGER) TO authenticated;

-- 4. RLS POLICIES (MULTI-ROLE HARDENED)

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Owner or Admin
CREATE POLICY "Profiles select" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

-- Verification Requests: Public insert, Admin manage
CREATE POLICY "Verification insert public" ON public.verification_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Verification admin manage" ON public.verification_requests FOR ALL USING (public.is_admin(auth.uid()));

-- Products & Variants: Admin CRUD, Verified SELECT (via direct or RPC-mediated)
CREATE POLICY "Products admin manage" ON public.products FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Products verified select" ON public.products FOR SELECT USING (
    public.is_admin(auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND verification_status = 'APPROVED' AND status = 'ACTIVE')
);

CREATE POLICY "Variants admin manage" ON public.product_variants FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Variants verified select" ON public.product_variants FOR SELECT USING (
    public.is_admin(auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND verification_status = 'APPROVED' AND status = 'ACTIVE')
);

-- Discounts & Categories: Admin manage, Authenticated SELECT
CREATE POLICY "Admin CRUD discounts" ON public.monthly_discounts FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin CRUD cat_discounts" ON public.category_discounts FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin CRUD categories" ON public.categories FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth select reference data" ON public.monthly_discounts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth select reference data cat" ON public.category_discounts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth select reference data categories" ON public.categories FOR SELECT USING (auth.role() = 'authenticated');

-- Orders & Progress: Owner or Admin
CREATE POLICY "Orders select" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
-- Orders insert/update logic usually handled by service_role (webhook), so no public policy unless needed for cart-to-order RPC.

CREATE POLICY "Order items select" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()) 
    OR public.is_admin(auth.uid())
);

-- Lesson Progress: Strict Owner/Admin logic
CREATE POLICY "Progress select" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Progress insert" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Progress update" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Academy: Granular visibility + Level lock + Override
CREATE POLICY "Courses select" ON public.courses FOR SELECT USING (
    public.is_admin(auth.uid()) OR (
        visibility_override = 'NORMAL' AND
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() 
            AND p.verification_status = 'APPROVED' 
            AND p.status = 'ACTIVE'
            AND p.level IN ('STANDARD', 'PREMIUM')
            AND (
                (visibility = 'BOTH') OR
                (visibility = 'STANDARD_ONLY' AND p.level IN ('STANDARD', 'PREMIUM')) OR
                (visibility = 'PREMIUM_ONLY' AND p.level = 'PREMIUM')
            )
        )
    )
);

CREATE POLICY "Modules select" ON public.modules FOR SELECT USING (
    public.is_admin(auth.uid()) OR
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id) 
);

CREATE POLICY "Lessons select" ON public.lessons FOR SELECT USING (
    public.is_admin(auth.uid()) OR (
        visibility_override = 'NORMAL' AND
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.modules m ON m.id = public.lessons.module_id
            JOIN public.courses c ON c.id = m.course_id
            WHERE p.id = auth.uid() 
            AND p.verification_status = 'APPROVED' 
            AND p.status = 'ACTIVE'
            AND p.level IN ('STANDARD', 'PREMIUM')
            AND c.visibility_override = 'NORMAL'
            AND (
                (public.lessons.visibility = 'BOTH') OR
                (public.lessons.visibility = 'STANDARD_ONLY' AND p.level IN ('STANDARD', 'PREMIUM')) OR
                (public.lessons.visibility = 'PREMIUM_ONLY' AND p.level = 'PREMIUM')
            )
        )
    )
);

-- 5. INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_monthly_discounts_lookup ON public.monthly_discounts(year_month, level);
CREATE INDEX IF NOT EXISTS idx_category_discounts_lookup ON public.category_discounts(year_month, level, category_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);

-- 6. SECURE RPCs

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS public.order_invoice_seq START 1000;

-- Secure Order Creation with VAT & Stock
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
    v_item RECORD;
    v_total_base INTEGER := 0;
    v_total_discount INTEGER := 0;
    v_vat_total INTEGER := 0;
    v_total_final INTEGER := 0;
    v_month TEXT := to_char(now(), 'YYYY-MM');
    v_p_pricing RECORD;
    v_invoice_num TEXT;
BEGIN
    -- 1. Get user info
    SELECT level, status INTO v_level, v_status
    FROM public.profiles WHERE id = v_user_id;

    IF v_user_id IS NULL OR v_status != 'ACTIVE' THEN
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
            COALESCE(cd.percent, md.percent, 0) as disc_pct,
            v.stock_count
        INTO v_p_pricing
        FROM public.product_variants v
        JOIN public.products p ON p.id = v.product_id
        LEFT JOIN public.monthly_discounts md ON md.year_month = v_month AND md.level = v_level
        LEFT JOIN public.category_discounts cd ON cd.year_month = v_month AND cd.level = v_level AND cd.category_id = p.category_id
        WHERE v.id = v_item.variant_id AND v.active = TRUE AND p.active = TRUE
        FOR UPDATE OF v;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variante introuvable ou inactive';
        END IF;

        IF v_p_pricing.stock_count < v_item.qty THEN
            RAISE EXCEPTION 'Stock insuffisant';
        END IF;

        -- Calculations
        DECLARE
            v_net_unit INTEGER := (round(v_p_pricing.base_price_cents * (100 - v_p_pricing.disc_pct) / 100.0))::INTEGER;
            v_vat_rate NUMERIC := CASE WHEN v_level = 'NONE' THEN 0.081 ELSE 0 END;
            v_vat_amt INTEGER := CASE WHEN v_level = 'NONE' THEN (round(v_net_unit * 0.081))::INTEGER ELSE 0 END;
            v_gross_unit INTEGER := v_net_unit + v_vat_amt;
            v_line_total INTEGER := v_gross_unit * v_item.qty;
        BEGIN
            -- Insert item
            INSERT INTO public.order_items (
                order_id, variant_id, qty, 
                base_unit_price_cents, discount_percent, net_unit_price_cents,
                vat_rate, vat_amount_cents, gross_unit_price_cents, line_total_cents
            ) VALUES (
                v_order_id, v_item.variant_id, v_item.qty,
                v_p_pricing.base_price_cents, v_p_pricing.disc_pct, v_net_unit,
                v_vat_rate, v_vat_amt, v_gross_unit, v_line_total
            );

            -- Accumulate totals
            v_total_base := v_total_base + (v_p_pricing.base_price_cents * v_item.qty);
            v_total_discount := v_total_discount + ((v_p_pricing.base_price_cents - v_net_unit) * v_item.qty);
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
        total_discount_cents = v_total_discount,
        vat_total_cents = v_vat_total,
        total_final_cents = v_total_final,
        invoice_number = v_invoice_num
    WHERE id = v_order_id;

    RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order_secure(JSONB, JSONB, JSONB) TO authenticated;
