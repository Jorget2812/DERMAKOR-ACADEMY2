# React Hooks Expert Skill

**Goal:** Leverage modern React patterns for clean, reusable, and performant logic.

## Steps

1.  **Hook Composition:**
    *   Extract repetitive logic into custom hooks (`useOrder`, `useAuth`).
    *   Ensure hooks are specialized and follow the "Rules of Hooks".
2.  **Performance Optimization:**
    *   Use `useMemo` and `useCallback` strategically to prevent expensive recalculations.
    *   Audit dependency arrays for stability and correctness.
3.  **Modern Hook Usage:**
    *   Implement React 19 hooks (`useFormStatus`, `useActionState`, `useOptimistic`).
    *   Replace legacy patterns with modern alternatives where possible.
4.  **Verification:**
    *   Ensure hooks handle loading and error states internally.

## Rules

*   **Keep it Pure:** Hooks should focus on logic/state, not side effects (where possible).
*   **Explicit Dependencies:** Never skip dependency arrays in `useEffect`.
*   **Reusability First:** Design hooks to be shared across features.
*   **Clean Departure:** Provide cleanup logic in `useEffect` when necessary.

## Expected Output

*   Elegant, reusable hooks that simplify component logic and improve performance.
