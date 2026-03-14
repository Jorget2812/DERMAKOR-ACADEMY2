# Code Review Skill

**Goal:** Ensure all code changes meet the highest technical standards of the DERMAKOR ACADEMY project.

## Steps

1.  **Requirement Check:**
    *   Verify the change fully implements the requested user objective.
    *   Ensure the implementation doesn't exceed the requested scope (no over-engineering).

2.  **Technical Standard Review:**
    *   **TypeScript:** Check for strict typing, no `any`, and correct interface definitions.
    *   **Architecture:** Verify the change fits in the correct domain/layer.
    *   **Performance:** Check for unnecessary renders, heavy imports, or slow queries.
    *   **Security:** Scan for hardcoded secrets, missing RLS, or input validation flaws.

3.  **UI/UX Quality Check:**
    *   Verify mobile responsiveness and accessibility.
    *   Ensure consistency with the premium design system (colors, typography).
    *   Check for proper localization (French, Italian, German).

4.  **Testing Verification:**
    *   Ensure new logic is covered by tests.
    *   Verify that `npx tsc --noEmit` and `npm run build` pass.

## Rules

*   **Be Constructive:** Provide actionable feedback with clear rationale.
*   **Consistency is Key:** Enforce the project's coding style and file structure.
*   **Don't Ship Bugs:** Catch edge cases (null checks, error handling) early.
*   **Minimize Debt:** Avoid "TODOs" or hacky workarounds without strong justification.
*   **Final Approval:** Only Paula (Reviewer) gives the final signal to merge/complete.
