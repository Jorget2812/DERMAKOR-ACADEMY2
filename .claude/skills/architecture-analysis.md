# Architecture Analysis Skill

**Goal:** Maintain system integrity and scalability by ensuring all changes align with the project's architectural standards (SOLID, Clean Architecture).

## Steps

1.  **Context Mapping:**
    *   Identify which domain or layer a change belongs to (Commerce, Admin, Lib, App).
    *   Analyze dependencies to ensure no circular imports or "leaky abstractions".

2.  **Pattern Verification:**
    *   Verify use of standard patterns (Server Actions, React Hooks, Domain Utils).
    *   Check for adherence to the "Single Responsibility Principle" in modules.
    *   Ensure data flows are unidirectional and predictable.

3.  **Interface Analysis:**
    *   Review contract/type definitions between layers.
    *   Identify potential for "Over-engineering" vs "Under-engineering".
    *   Ensure clean separation between UI (React) and Logic (Server Actions/Utils).

4.  **Growth Strategy:**
    *   Evaluate if a change makes future scaling harder.
    *   Suggest refactoring if a component is becoming a "God Object".

## Rules

*   **Clean over Clever:** Prioritize readable, standard patterns over experimental or complex ones.
*   **Separation of Concerns:** Keep UI, Logic, and Data Access distinct.
*   **Domain Isolation:** Logic specific to one domain shouldn't bleed into another unnecessarily.
*   **Standardize:** Always use the existing `email-service`, `logger`, and `supabase` client utilities.
*   **Plan Before Execution:** Always run an architecture check during the Planning phase.
