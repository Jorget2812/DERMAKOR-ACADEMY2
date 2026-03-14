# Root Cause Analysis (RCA) Skill

**Goal:** Identify the exact origin and cause of complex bugs or failures using evidence-based reasoning.

## Steps

1.  **Data Consolidation:**
    *   Collect all relevant logs, error traces, and environment state.
    *   Document exact reproduction steps and current vs. expected behavior.
2.  **Hypothesis Formulation:**
    *   List 3-5 potential root causes based on the data.
    *   Identify "Silent Failures" where logic fails without throwing errors.
3.  **Experimental Isolation:**
    *   Use "Divide and Conquer" to isolate the faulty component.
    *   Create minimal reproduction scripts or log-based probes.
4.  **Verification:**
    *   Confirm the hypothesis by intentionally triggering the failure.
    *   Verify that the proposed fix resolves the issue in isolation.
5.  **Prevention:**
    *   Implement a regression test (Unit/E2E).
    *   Update `memory/decisions.md` with findings to prevent recurrence.

## Rules

*   **Evidence Only:** Never guess; every claim must be backed by a log or trace.
*   **Isolate First:** Always reproduce the bug in a clean environment before fixing.
*   **Deep Fix:** Addresses the root cause, not just the symptom.
*   **Atomic Changes:** Keep the fix focused on the specific bug.

## Expected Output

*   A documented root cause and a verified, tested fix.
