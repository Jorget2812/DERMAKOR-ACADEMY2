# Legacy Code Modernization Skill

**Goal:** Systematically upgrade aging code to modern standards and patterns.

## Steps

1.  **Debt Assessment:**
    *   Identify deprecated APIs or patterns (e.g., Pages Router to App Router).
    *   Evaluate the complexity and risk of a migration path.
2.  **Incremental Migration:**
    *   Create a dual-state (compatibility layer) if full migration is too risky.
    *   Modernize logic in small, testable chunks.
3.  **Interface Stabilization:**
    *   Ensure the modernized code maintains backward compatibility during transition.
    *   Update dependencies to stable, high-performance versions.
4.  **Validation:**
    *   Run comprehensive regression tests.
    *   Verify that modernization also improves performance or security.

## Rules

*   **Don't Break Prod:** Stability is more important than "newness".
*   **Test-Backed:** No modernization without existing or new tests.
*   **Document Progress:** Note migration steps in `memory/decisions.md`.
*   **Clean Departure:** Completely remove old code once the new path is stable.

## Expected Output

*   Modernized code with improved metrics and reduced technical debt.
