# TypeScript Excellence Skill

**Goal:** Maintain strict type safety, maximize developer productivity, and prevent runtime errors.

## Steps

1.  **Strictness Review:**
    *   Eliminate `any` and `unknown` in favor of specific types/interfaces.
    *   Ensure `strictNullChecks` are respected in all new code.
2.  **Abstraction Design:**
    *   Use Generics effectively for reusable components and utilities.
    *   Leverage Discriminated Unions for complex component states.
3.  **Schema Validation:**
    *   Integrate Zod for runtime schema validation (API inputs, DB results).
    *   Ensure types flow consistently from the DB layer to the UI.
4.  **Developer Experience:**
    *   Write clear JSDoc for complex types and functions.
    *   Organize shared types in `@/types/` or domain-specific files.

## Rules

*   **No Implicit Any:** Always define types explicitly for complex objects.
*   **Prefer Interfaces:** Use interfaces for objects and types for unions/aliases.
*   **Single Source of Truth:** Share types between server and client where possible.
*   **Keep it Simple:** Avoid overly complex type gymnastics that hurt readability.

## Expected Output

*   Strictly typed code with 100% type coverage and Zod validation where applicable.
