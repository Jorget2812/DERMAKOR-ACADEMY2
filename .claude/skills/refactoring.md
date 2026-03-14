# Refactoring Skill

**Goal:** Improve code quality, maintainability, and readability through systematic refactoring without changing observable behavior.

## Steps

1.  **Code Assessment:**
    *   Identify code smells (duplication, long methods, high complexity).
    *   Evaluate adherence to SOLID principles.
    *   Assess consistency with the project's architectural patterns (e.g., Domain-Driven Design).

2.  **Safety Net Establishment:**
    *   Ensure a comprehensive test suite exists for the target code.
    *   If tests are missing, implement them before refactoring.
    *   Capture a baseline for performance if the module is critical.

3.  **Small Incremental Changes:**
    *   Extract methods/functions to reduce complexity.
    *   Rename variables and functions for better clarity.
    *   Simplify boolean logic and conditionals.
    *   Consolidate duplicate logic into reusable utilities or hooks.

4.  **Interface Stabilization:**
    *   Avoid changing public APIs or component interfaces during refactoring.
    *   If interface changes are necessary, follow a deprecation strategy.

5.  **Validation:**
    *   Run tests after every small change.
    *   Verify that functional behavior remains identical.
    *   Perform a final code review for cleanliness.

## Rules

*   **One Thing at a Time:** Do not mix refactoring with new feature implementation or bug fixes.
*   **Keep Tests Green:** Never leave the codebase in a broken state for long.
*   **Prefer Composition:** In React, prefer component composition over complex prop-drilling or large monolithic components.
*   **Strict Typing:** Ensure TypeScript types are strengthened, not weakened, during refactoring.
*   **Respect Domains:** Stay within established domain boundaries (e.g., commerce vs. admin).
