# Functional Programming Principles Skill

**Goal:** Increase code predictability, testability, and reliability via functional patterns.

## Steps

1.  **Immutability Enforcer:**
    *   Always use non-mutating array methods (e.g., `map`, `filter`, `reduce`).
    *   Ensure state updates use spread operators rather than direct mutation.
2.  **Pure Function Design:**
    *   Extract complex logic into pure functions with zero side effects.
    *   Ensure functions return the same output for the same input.
3.  **Composition Patterns:**
    *   Leverage function composition to build complex logic from small primitives.
    *   Use standard functional utilities (currying, partial application) where appropriate.
4.  **Verification:**
    *   Write focused unit tests for extracted pure functions.

## Rules

*   **No Side Effects:** Core logic functions must not modify external state.
*   **Type Safety:** Leverage TypeScript to enforce immutability (`readonly`).
*   **Clarity over Conciseness:** Functional patterns must improve readability, not hurt it.
*   **Prefer Declarative:** Say "What" to do, not "How" to do it.

## Expected Output

*   Highly testable, immutable logic that minimizes bugs and side effects.
