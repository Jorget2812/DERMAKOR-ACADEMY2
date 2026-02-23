-- 1. Create the 'invoices' bucket if it doesn't exist
-- public: false means signed URLs are required for access
INSERT INTO storage.buckets (id, name, public)
SELECT 'invoices', 'invoices', false
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'invoices'
);

-- 2. Enable RLS on storage.objects (usually enabled by default in Supabase)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Delete existing policies for 'invoices' to prevent duplicates (idempotency)
DROP POLICY IF EXISTS "Admins can upload invoices" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view invoices" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete invoices" ON storage.objects;

-- 4. Policy: INSERT - Only Admins or service_role can upload
CREATE POLICY "Admins can upload invoices"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'invoices' AND (
        public.is_admin(auth.uid()) OR 
        (SELECT auth.jwt()->>'role') = 'service_role'
    )
);

-- 5. Policy: SELECT - Only Admins or service_role can select
CREATE POLICY "Admins can view invoices"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'invoices' AND (
        public.is_admin(auth.uid()) OR 
        (SELECT auth.jwt()->>'role') = 'service_role'
    )
);

-- 6. Policy: DELETE - Only Admins
CREATE POLICY "Admins can delete invoices"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'invoices' AND public.is_admin(auth.uid())
);
