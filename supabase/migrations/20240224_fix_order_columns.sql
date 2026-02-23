-- 20240224_fix_order_columns.sql

-- 1. Add missing columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invoice_pdf_path TEXT,
ADD COLUMN IF NOT EXISTS invoice_generated_at TIMESTAMPTZ;

-- 2. Ensure RLS policies are up to date for orders
-- (Assuming they already exist but ensuring admin can update these new columns)
DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin manage orders" 
ON public.orders 
FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid())) 
WITH CHECK (public.is_admin(auth.uid()));

-- 3. Audit Logs check
-- Ensure audit_logs table exists and has proper types if needed
-- (Skipped if already present and functional)
