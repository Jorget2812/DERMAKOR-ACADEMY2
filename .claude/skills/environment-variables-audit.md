# Environment Variables Audit Skill

**Goal:** Secure configuration management and prevent secret leakage.

## Steps

1.  **Exposure Scan:**
    *   Ensure no secret (`STRIPE_SECRET`, `SUPABASE_SERVICE_ROLE`) is prefixed with `NEXT_PUBLIC_`.
    *   Check for secrets accidentally committed to the repository (check history).
2.  **Parity Audit:**
    *   Verify that `.env.example` includes all necessary (sanitized) keys.
    *   Check for configuration consistency across Local/Preview/Prod.
3.  **Runtime Validation:**
    *   Verify that the application fails early with a clear message if a mandatory key is missing.
    *   Ensure Server Actions only access variables on the server-side.
4.  **Cleanup:**
    *   Identify and remove unused environment variables.

## Rules

*   **Never Commit Secrets:** If a secret is committed, it must be rotated immediately.
*   **Public is Dangerous:** Only use `NEXT_PUBLIC_` for non-sensitive UI-only config.
*   **Sanitize Logs:** Ensure environment variables are never logged in plain text.
*   **Strict Access:** Use a central config utility to access environment variables.

## Expected Output

*   Verified secure configuration and up-to-date `.env.example`.
