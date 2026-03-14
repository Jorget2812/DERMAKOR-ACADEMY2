# Security Analysis Skill

**Goal:** Proactively identify and mitigate security risks across the application, protecting user data and business integrity.

## Steps

1.  **Threat Modeling:**
    *   Identify entry points (API routes, Server Actions, Webhooks).
    *   Map data flow through sensitive areas (Auth, Stripe, Database).
    *   Think like an attacker to identify potential exploits (Injection, CSRF, XSS).

2.  **Access Control Audit:**
    *   Verify Supabase RLS policies for every table.
    *   Audit Next.js middleware for proper authentication/authorization checks.
    *   Ensure Server Actions implement "Session Validation" at the start.

3.  **Input & Data Validation:**
    *   Enforce strict schema validation for all user inputs (Zod/TypeScript).
    *   Sanitize data before rendering and before database insertion.
    *   Protect against "Mass Assignment" vulnerabilities in database updates.

4.  **Integration Security:**
    *   Validate Stripe webhook signatures using secret keys.
    *   Ensure environment variables (`.env`) are never exposed to the client.
    *   Audit third-party dependencies for known vulnerabilities.

## Rules

*   **Deny by Default:** Start with restricted access (RLS) and open only what is necessary.
*   **Never Trust Client Input:** Always re-validate everything on the server.
*   **Least Privilege:** Give agents and services the minimum permissions required.
*   **Secrets Stay Secret:** Use Sentry/logging carefully to avoid leaking PII or credentials.
*   **Prompt Injection Awareness:** When using AI agents, sanitize outputs and strictly define boundaries (CLAUDE.md).
