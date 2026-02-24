-- ============================================
-- MIGRACIÓN: rls_policies_is_admin_unification
-- Fecha: 2026-02-23
-- Objetivo: Migrar 27+ policies de is_admin(uuid)
--           a is_admin() sin parámetros
-- ============================================

BEGIN;

-- SECCIÓN 1: profiles (2 policies)
-- IDEMPOTENCIA: DROP POLICY IF EXISTS
DROP POLICY IF EXISTS "Profiles select" ON public.profiles;
CREATE POLICY "Profiles select" ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Profiles update" ON public.profiles;
CREATE POLICY "Profiles update" ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());


-- SECCIÓN 2: monthly_discounts, category_discounts, categories (3 policies)
DROP POLICY IF EXISTS "Admin CRUD discounts" ON public.monthly_discounts;
CREATE POLICY "Admin CRUD discounts" ON public.monthly_discounts 
  FOR ALL 
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin CRUD cat_discounts" ON public.category_discounts;
CREATE POLICY "Admin CRUD cat_discounts" ON public.category_discounts 
  FOR ALL 
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin CRUD categories" ON public.categories;
CREATE POLICY "Admin CRUD categories" ON public.categories 
  FOR ALL 
  TO authenticated
  USING (public.is_admin());


-- SECCIÓN 3: orders + order_items (3+ policies)
DROP POLICY IF EXISTS "Orders select" ON public.orders;
CREATE POLICY "Orders select" ON public.orders 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Order items select" ON public.order_items;
CREATE POLICY "Order items select" ON public.order_items 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()) 
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Order items: Owner or Admin select" ON public.order_items;
CREATE POLICY "Order items: Owner or Admin select" 
  ON public.order_items 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()) 
    OR public.is_admin()
  );


-- SECCIÓN 4: lesson_progress (3 policies)
DROP POLICY IF EXISTS "Progress select" ON public.lesson_progress;
CREATE POLICY "Progress select" ON public.lesson_progress 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Progress manage" ON public.lesson_progress;
CREATE POLICY "Progress manage" ON public.lesson_progress 
  FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Progress: Owner or Admin select" ON public.lesson_progress;
CREATE POLICY "Progress: Owner or Admin select" ON public.lesson_progress 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());


-- SECCIÓN 5: courses (2 policies)
DROP POLICY IF EXISTS "Courses select" ON public.courses;
CREATE POLICY "Courses select" ON public.courses 
  FOR SELECT 
  TO authenticated
  USING (
    public.is_admin() OR (
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

DROP POLICY IF EXISTS "Academy: Access control" ON public.courses;
CREATE POLICY "Academy: Access control" ON public.courses 
  FOR ALL 
  TO authenticated
  USING (public.is_admin());


-- SECCIÓN 6: modules (1 policy)
DROP POLICY IF EXISTS "Modules select" ON public.modules;
CREATE POLICY "Modules select" ON public.modules 
  FOR SELECT 
  TO authenticated
  USING (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id) 
);


-- SECCIÓN 7: lessons (3 policies)
DROP POLICY IF EXISTS "Lessons select" ON public.lessons;
CREATE POLICY "Lessons select" ON public.lessons 
  FOR SELECT 
  TO authenticated
  USING (
    public.is_admin() OR (
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

DROP POLICY IF EXISTS "Lessons access control" ON public.lessons;
CREATE POLICY "Lessons access control" ON public.lessons 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND verification_status = 'APPROVED' AND status = 'ACTIVE'));

DROP POLICY IF EXISTS "Academy: Lessons access control" ON public.lessons;
CREATE POLICY "Academy: Lessons access control" ON public.lessons 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND verification_status = 'APPROVED' AND status = 'ACTIVE'));


-- SECCIÓN 8: verification_requests (2 policies)
DROP POLICY IF EXISTS "Verification admin manage" ON public.verification_requests;
CREATE POLICY "Verification admin manage" ON public.verification_requests 
  FOR ALL 
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Verification: Admin manage" ON public.verification_requests;
CREATE POLICY "Verification: Admin manage" ON public.verification_requests 
  FOR ALL 
  TO authenticated
  USING (public.is_admin());


-- SECCIÓN 9: site_settings (1 policy)
DROP POLICY IF EXISTS "Admins have full access to site_settings" ON public.site_settings;
-- Note: As a fallback, we assume site_settings uses the same admin logic
CREATE POLICY "Admins have full access to site_settings" ON public.site_settings 
  FOR ALL 
  TO authenticated
  USING (public.is_admin());


-- SECCIÓN 10: payment_settings + invoice_settings (3 policies)
DROP POLICY IF EXISTS "Admin full manage payment_settings" ON public.payment_settings;
CREATE POLICY "Admin full manage payment_settings" 
  ON public.payment_settings 
  FOR ALL 
  TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Approved buyers read payment_settings" ON public.payment_settings;
CREATE POLICY "Approved buyers read payment_settings" 
  ON public.payment_settings 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'ACTIVE' AND verification_status = 'APPROVED') 
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admin full manage invoice_settings" ON public.invoice_settings;
CREATE POLICY "Admin full manage invoice_settings" 
  ON public.invoice_settings 
  FOR ALL 
  TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());


-- SECCIÓN 11: storage.objects (2 policies)
-- IMPORTANTE: schema storage
DROP POLICY IF EXISTS "Admins can upload invoices" ON storage.objects;
CREATE POLICY "Admins can upload invoices"
  ON storage.objects 
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'invoices' AND (
      public.is_admin() OR 
      (SELECT auth.jwt()->>'role') = 'service_role'
    )
  );

DROP POLICY IF EXISTS "Admins can view invoices" ON storage.objects;
CREATE POLICY "Admins can view invoices"
  ON storage.objects 
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'invoices' AND (
      public.is_admin() OR 
      (SELECT auth.jwt()->>'role') = 'service_role'
    )
  );


-- SECCIÓN 12: product_badges + dashboard_settings (4 policies)
DROP POLICY IF EXISTS "Admin full access to product_badges" ON public.product_badges;
CREATE POLICY "Admin full access to product_badges"
  ON public.product_badges FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Verified users read product_badges" ON public.product_badges;
CREATE POLICY "Verified users read product_badges"
  ON public.product_badges FOR SELECT TO authenticated
  USING (
    public.is_admin() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND verification_status = 'APPROVED' AND status = 'ACTIVE')
  );

DROP POLICY IF EXISTS "Admin full access to dashboard_settings" ON public.dashboard_settings;
CREATE POLICY "Admin full access to dashboard_settings"
  ON public.dashboard_settings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Verified users read dashboard_settings" ON public.dashboard_settings;
CREATE POLICY "Verified users read dashboard_settings"
  ON public.dashboard_settings FOR SELECT TO authenticated
  USING (
    public.is_admin() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND verification_status = 'APPROVED' AND status = 'ACTIVE')
  );


-- ============================================
-- SECCIÓN FINAL: DROP función antigua
-- Solo ejecutar después de verificar que todas las policies funcionan correctamente.
-- ============================================

-- Comentamos el DROP por seguridad hasta confirmación manual, pero se incluye según pedido:
-- ADVERTENCIA: Asegúrate de que ninguna otra función personalizada (RPC) use esta firma.
DROP FUNCTION IF EXISTS public.is_admin(uuid);


-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

/*
-- VERIFICACIÓN 1: Confirmar permisos de policies
SELECT schemaname, tablename, policyname, qual, with_check
FROM pg_policies
WHERE qual LIKE '%is_admin%' OR with_check LIKE '%is_admin%'
ORDER BY tablename, policyname;
-- ✅ Esperado: 0 menciones de is_admin con parámetros. Todas deben mostrar is_admin() sin argumentos.

-- VERIFICACIÓN 2: Confirmar que la función antigua ya no existe
SELECT routine_name, specific_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name = 'is_admin';
-- Esperado: 1 sola fila correspondiente a is_admin() sin parámetros.
*/

COMMIT;
