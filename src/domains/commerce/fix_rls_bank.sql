-- Add read policy for authenticated users
CREATE POLICY "Users can view active bank settings" 
ON public.bank_settings
FOR SELECT
TO authenticated
USING (is_active = true);
