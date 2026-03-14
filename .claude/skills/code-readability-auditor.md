# Code Readability Auditor Skill

**Goal:** Ensure the codebase is clean, intuitive, and easy for any developer to understand.

## Steps

1.  **Naming Audit:**
    *   Verify variables, functions, and classes have semantic, descriptive names.
    *   Avoid abbreviations or generic terms (e.g., `data`, `info`).
2.  **Structure Review:**
    *   Ensure functions are small and focused on one task.
    *   Audit for unnecessary complexity or "over-engineered" abstractions.
3.  **Comments & JSDoc:**
    *   Check for clear explanations of "Why" rather than "What".
    *   Ensure all public exports have high-quality JSDoc.
4.  **Style Consistency:**
    *   Enforce the project's formatting and styling rules.
    *   Identify and remove "Dead Code" (unused variables/functions).

## Rules

*   **Write for Humans:** Code is read more often than written.
*   **Self-Documenting:** If you need a comment to explain "What", rename the code.
*   **Consistency over Preference:** Follow established project conventions.
*   **Simplify:** Delete code that doesn't add value.

## Expected Output

*   Cleaner, more intuitive codebase with improved developer velocity.
