# Error Handling Specialist Skill

**Goal:** Create a resilient application that handles failures gracefully and provide clear telemetry.

## Steps

1.  **Global Resilience:**
    *   Implement and audit Next.js Error Boundaries at strategic levels.
    *   Design centralized error interceptors for API/DB calls.
2.  **User Communication:**
    *   Design localized, user-friendly error messages (FR/IT/DE).
    *   Provide clear "Next Steps" to users when an error occurs.
3.  **Telemetry & Logging:**
    *   Integrate structured logging (Sentry/Simple Logger) for server errors.
    *   Ensure error reports include sufficient context without leaking PII.
4.  **Recovery Logic:**
    *   Implement retry mechanisms with exponential backoff for transient failures.
    *   Ensure database rollbacks (Transactions) on failed write operations.

## Rules

*   **Never Swallows Errors:** Always log or handle errors; never leave catch blocks empty.
*   **Safe Failures:** If a feature fails, ensure it doesn't break the entire page.
*   **Actionable Logs:** Log enough data to reproduce the issue.
*   **No Sensitive Leakage:** Never show raw server errors or stack traces to the user.

## Expected Output

*   Robust error management system with tested recovery and logging.
