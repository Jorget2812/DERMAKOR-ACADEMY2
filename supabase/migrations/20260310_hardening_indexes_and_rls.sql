-- ============================================================
-- Migration: 20260310_hardening_indexes_and_rls
-- Purpose: Performance indexes + RLS audit guards
-- ============================================================

-- ─── Indexes ─────────────────────────────────────────────────────────────────

-- stripe_events: idempotency lookup is on event_id
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id
    ON public.stripe_events (event_id);

-- invitation_tokens: token lookup on every set-password request
-- (index may already exist from 20260305 migration — IF NOT EXISTS is safe)
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_token
    ON public.invitation_tokens (token)
    WHERE used = false;  -- partial index: only unburned tokens matter for lookups

-- invitation_tokens: cleanup queries by user_id
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_user_id
    ON public.invitation_tokens (user_id);

-- orders: frequent lookup by user_id
CREATE INDEX IF NOT EXISTS idx_orders_user_id
    ON public.orders (user_id);

-- orders: webhook lookup by stripe_session_id
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id
    ON public.orders (stripe_session_id)
    WHERE stripe_session_id IS NOT NULL;

-- profiles: email lookup (used in admin search)
CREATE INDEX IF NOT EXISTS idx_profiles_email
    ON public.profiles (email);

-- audit_logs: admin dashboard queries by resource
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
    ON public.audit_logs (resource_type, resource_id);

-- audit_logs: time-series queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON public.audit_logs (created_at DESC);

-- ─── RLS Verification Comments ───────────────────────────────────────────────
-- Run this query in Supabase Studio to audit all table RLS policies:
--
-- SELECT
--   t.tablename,
--   t.rowsecurity AS rls_enabled,
--   COALESCE(
--     json_agg(json_build_object(
--       'policy', p.policyname,
--       'cmd', p.cmd,
--       'roles', p.roles
--     )) FILTER (WHERE p.policyname IS NOT NULL),
--     '[]'
--   ) AS policies
-- FROM pg_tables t
-- LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
-- WHERE t.schemaname = 'public'
-- GROUP BY t.tablename, t.rowsecurity
-- ORDER BY t.tablename;
