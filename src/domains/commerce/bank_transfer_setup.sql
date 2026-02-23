CREATE TABLE IF NOT EXISTS public.bank_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name TEXT NOT NULL,
    iban TEXT NOT NULL,
    swift_bic TEXT NOT NULL,
    account_holder TEXT NOT NULL,
    instructions TEXT,
    qr_code_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bank_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage bank settings" ON public.bank_settings;
CREATE POLICY "Admins can manage bank settings" 
ON public.bank_settings
FOR ALL 
USING (
    public.is_admin()
);

DROP POLICY IF EXISTS "Authenticated users can read bank settings" ON public.bank_settings;
CREATE POLICY "Authenticated users can read bank settings" 
ON public.bank_settings
FOR SELECT
USING (auth.role() = 'authenticated' AND is_active = true);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type') THEN
        CREATE TYPE payment_method_type AS ENUM ('STRIPE', 'BANK_TRANSFER');
    END IF;
END $$;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method payment_method_type DEFAULT 'BANK_TRANSFER',
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_bank_settings_updated_at ON public.bank_settings;
CREATE TRIGGER update_bank_settings_updated_at
    BEFORE UPDATE ON public.bank_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
