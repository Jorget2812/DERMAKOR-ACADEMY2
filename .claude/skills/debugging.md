# Debugging Skill

**Goal:** Efficiently identify, isolate, and fix bugs in complex AI-agent driven systems and Next.js full-stack applications.

## Steps

1.  **Trace Analysis:**
    *   Examine the execution trace (logs, agent steps, terminal output).
    *   Identify the exact point where the actual behavior diverged from the expected behavior.
    *   Capture relevant state at the point of failure (variables, props, database content).

2.  **Hypothesis Generation:**
    *   Formulate multiple hypotheses for the root cause.
    *   Prioritize hypotheses based on probability and impact.
    *   Consider "silent failures" (logic errors that don't throw exceptions).

3.  **Experimental Verification:**
    *   Create targeted tests or reproduction scripts to isolate the bug.
    *   Use log-based debugging to monitor state changes in real-time.
    *   If non-deterministic (AI related), run multiple iterations to verify the pattern.

4.  **Root Cause Correction:**
    *   Apply a fix that addresses the underlying issue, not just the symptom.
    *   Refactor surrounding code if necessary to prevent similar bugs.

5.  **Verification & Regression:**
    *   Verify the fix using the reproduction script.
    *   Run full test suite (`npm run test`) to ensure no regressions.
    *   Document the bug and fix in `memory/decisions.md` if significant.

## Rules

*   **Never assume:** Always verify assumptions with data or traces.
*   **Don't "Guess-and-Check":** Follow a systematic approach.
*   **Isolate First:** Always reproduce the bug in isolation before fixing.
*   **Think Non-Deterministic:** When debugging AI agents, consider context window pressure and token limitations.
*   **Safety First:** When debugging database issues, use transactions and rollbacks where possible.
