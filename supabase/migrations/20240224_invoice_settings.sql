-- 20240224_invoice_settings_v2.sql

-- 1. Create/Update invoice_settings table
CREATE TABLE IF NOT EXISTS public.invoice_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    use_payment_data BOOLEAN NOT NULL DEFAULT true, -- If true, uses bank data from payment_settings
    
    -- Company Identity
    company_name TEXT NOT NULL DEFAULT 'DERMAKOR ACADEMY',
    company_address TEXT NOT NULL,
    company_city TEXT,
    company_zip TEXT,
    company_country TEXT DEFAULT 'CH',
    company_vat_number TEXT,
    company_email TEXT,
    company_phone TEXT,
    logo_url TEXT,
    
    -- Manual Bank Info (used if use_payment_data is false)
    bank_account_holder TEXT,
    bank_name TEXT,
    iban TEXT,
    swift_bic TEXT,
    
    -- Documents
    footer_text TEXT,
    terms_text TEXT,
    
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Ensure columns exist if table was partially created
ALTER TABLE public.invoice_settings ADD COLUMN IF NOT EXISTS use_payment_data BOOLEAN NOT NULL DEFAULT true;

-- 2. Enable RLS
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Admin full manage invoice_settings" ON public.invoice_settings;
CREATE POLICY "Admin full manage invoice_settings" 
ON public.invoice_settings 
FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid())) 
WITH CHECK (public.is_admin(auth.uid()));

-- 4. Seed initial data
INSERT INTO public.invoice_settings (
    company_name,
    company_address,
    company_city,
    company_zip,
    company_email,
    footer_text,
    terms_text,
    use_payment_data
)
SELECT 
    'DERMAKOR ACADEMY',
    'Ch des Champs-Courbes 1',
    'Ecublens',
    '1024',
    'academy@dermakor.com',
    'Dermakor Academy | Switzerland',
    'Merci pour votre confiance. Paiement à 10 jours.',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.invoice_settings);
