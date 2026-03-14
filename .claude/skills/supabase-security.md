# Supabase Security Skill

**Goal:** Ensure database integrity and security by strictly enforcing Row Level Security (RLS) and secure Auth patterns.

## Steps

1.  **Schema Auditing:**
    *   Verify table structures and relationships in `src/lib/supabase/types.ts`.
    *   Ensure all sensitive tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

2.  **Policy Engineering:**
    *   Write granular RLS policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
    *   Use `auth.uid()` to restrict data access to the owner.
    *   Audit and implement "Service Role" exceptions only in secure Server Actions.

3.  **Auth Integration:**
    *   Verify Supabase Auth flow (PKCE/SSR).
    *   Implement secure password reset and email verification patterns.
    *   Ensure session cookies are properly managed (HttpOnly, Secure).

4.  **RPC & Function Security:**
    *   Audit Postgres functions (RPC) for potential SQL injection.
    *   Enforce security context (`SECURITY DEFINER` vs `SECURITY INVOKER`) correctly.

## Rules

*   **RLS is Mandatory:** No table should be accessible without a specific security policy.
*   **Validate UID:** Never trust a `user_id` passed directly from the client; always use `auth.uid()`.
*   **Schema Isolation:** Keep public, private, and internal schemas clearly separated.
*   **Minimal Service Role:** Only use the `service_role` key for administrative or initialization tasks.
*   **Log Access:** Audit sensitive data access in `memory/security.md`.
