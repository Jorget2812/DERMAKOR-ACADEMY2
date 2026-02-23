-- 20240224_bank_transfer_settings.sql

-- FASE 1: DB: Renombrar o crear tabla global payment_settings
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bank_settings' AND table_schema = 'public') THEN
        ALTER TABLE public.bank_settings RENAME TO payment_settings;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.payment_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    account_holder TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    iban TEXT NOT NULL,
    swift_bic TEXT,
    bank_address TEXT,
    beneficiary_address TEXT,
    reference_template TEXT, -- Ej: "COMMANDE-{order_id}"
    notes TEXT,               -- Instrucciones adicionales
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Asegurar que las columnas existan si la tabla existía pero era diferente
ALTER TABLE public.payment_settings ALTER COLUMN swift_bic DROP NOT NULL;
ALTER TABLE public.payment_settings ADD COLUMN IF NOT EXISTS bank_address TEXT;
ALTER TABLE public.payment_settings ADD COLUMN IF NOT EXISTS beneficiary_address TEXT;
ALTER TABLE public.payment_settings ADD COLUMN IF NOT EXISTS reference_template TEXT;
ALTER TABLE public.payment_settings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.payment_settings ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Constraint for active settings
ALTER TABLE public.payment_settings DROP CONSTRAINT IF EXISTS check_active_info;
ALTER TABLE public.payment_settings 
ADD CONSTRAINT check_active_info 
CHECK (
    NOT is_active OR (
        account_holder <> '' AND 
        bank_name <> '' AND 
        iban <> ''
    )
);

-- RLS: enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Clean existing policies before recreate
DROP POLICY IF EXISTS "Admin full manage payment_settings" ON public.payment_settings;
DROP POLICY IF EXISTS "Admins can manage bank settings" ON public.payment_settings;
DROP POLICY IF EXISTS "Approved buyers read payment_settings" ON public.payment_settings;
DROP POLICY IF EXISTS "Authenticated users can read bank settings" ON public.payment_settings;

-- Admin full control
CREATE POLICY "Admin full manage payment_settings" 
ON public.payment_settings 
FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid())) 
WITH CHECK (public.is_admin(auth.uid()));

-- Read for buyers (approved and active)
CREATE POLICY "Approved buyers read payment_settings" 
ON public.payment_settings 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND status = 'ACTIVE' 
        AND verification_status = 'APPROVED'
    ) 
    OR public.is_admin(auth.uid())
);

-- Seed: insertar 1 fila si tabla está vacía
INSERT INTO public.payment_settings (
    account_holder, 
    bank_name, 
    iban, 
    reference_template, 
    notes
)
SELECT 'DERMAKOR ACADEMY SA', 'PostFinance', 'CH00 0000 0000 0000 0000 0', 'COMMANDE-{order_id}', 'Veuillez indiquer le numéro de commande en référence.'
WHERE NOT EXISTS (SELECT 1 FROM public.payment_settings);
