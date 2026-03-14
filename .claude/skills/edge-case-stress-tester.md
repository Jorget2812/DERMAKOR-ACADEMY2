# Edge Case & Stress Tester Skill

**Goal:** Ensure application robustness by testing boundary conditions and high-load scenarios.

## Steps

1.  **Scenario Identification:**
    *   Identify limit cases (zero data, massive data, weird characters).
    *   Spot potential race conditions in async operations.
2.  **Input Fuzzing:**
    *   Test forms and APIs with unexpected or malicious inputs.
    *   Simulate slow network conditions and partial failures.
3.  **Resource Stressing:**
    *   Simulate high-concurrency requests to Supabase/API.
    *   Verify app behavior during third-party API (Stripe/Nodemailer) outages.
4.  **Verification:**
    *   Ensure the system fails gracefully with clear error messages.
    *   Verify that no data corruption occurs during state-of-failure.

## Rules

*   **Protect Production:** Never run stress tests against productive environments.
*   **Graceful Degradation:** The UI must always remain responsive, even during failure.
*   **Zero Data Corruption:** Integrity is the absolute priority.
*   **Automate Limits:** Include boundary tests in the permanent test suite.

## Expected Output

*   Identified vulnerabilities and implemented robustness fixes/guards.
