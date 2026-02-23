-- FIX: Add missing column to invoice_settings
ALTER TABLE public.invoice_settings 
ADD COLUMN IF NOT EXISTS use_payment_data BOOLEAN NOT NULL DEFAULT true;

-- Ensure schema cache is updated (this is automatic in Supabase but good for clarity)
COMMENT ON COLUMN public.invoice_settings.use_payment_data IS 'If true, uses bank data from payment_settings';
