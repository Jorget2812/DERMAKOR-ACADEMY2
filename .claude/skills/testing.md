# Testing Skill

**Goal:** Ensure high reliability and regression-free development through automated testing at all levels (Unit, Integration, E2E).

## Steps

1.  **Test Planning:**
    *   Determine the appropriate test level (Unit for logic, E2E for critical flows).
    *   Identify "happy path" and "edge cases" (error handling, empty states).

2.  **Test Environment Setup:**
    *   Use Playwright for E2E tests focusing on user-visible outcomes.
    *   Mock external services (Supabase, Stripe, Nodemailer) for lower-level tests.
    *   Use consistent test data that mimics production scenarios.

3.  **Implementation:**
    *   Write descriptive test names (e.g., `should_redirect_unverified_user_to_verification_page`).
    *   Follow the Arrange-Act-Assert (AAA) pattern.
    *   Ensure tests are independent and don't rely on global state.

4.  **Verification:**
    *   Run tests locally (`npx playwright test`).
    *   Verify coverage for critical business logic (pricing, auth, payments).
    *   Implement "Visual Regression" checks for UI-sensitive changes.

## Rules

*   **Test Reality, Not Mocks:** For E2E, prefer real database states (Supabase) over deep mocking where possible.
*   **Flaky-Free:** Investigate and fix flaky tests immediately; don't just retry.
*   **Fail Fast:** Design tests to provide clear, actionable error messages.
*   **Accessibility First:** Use locators that reflect accessibility (role, label) rather than CSS classes.
*   **Keep it Fast:** Optimize test execution time through parallelism and smart setup.
