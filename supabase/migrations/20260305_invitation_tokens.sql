-- Migration: Custom invitation tokens table
-- Prevents Gmail prefetch from consuming Supabase OTP tokens
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.invitation_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    email       TEXT        NOT NULL,
    token       TEXT        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    used        BOOLEAN     NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write invitation_tokens
CREATE POLICY "invitation_tokens_admin_only"
    ON public.invitation_tokens
    FOR ALL
    USING (public.is_admin());

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS invitation_tokens_token_idx ON public.invitation_tokens (token);
CREATE INDEX IF NOT EXISTS invitation_tokens_user_idx  ON public.invitation_tokens (user_id);
