# State Management Architect Skill

**Goal:** Implement clean, predictable, and performant state synchronization.

## Steps

1.  **Pattern Selection:**
    *   Prioritize URL state (query params) for UI synchronization (Search/Filters).
    *   Use React `useActionState` and `useOptimistic` for form interactions.
2.  **Shared State Design:**
    *   Evaluate if a context is truly necessary (e.g., Theme, Auth).
    *   Prefer component composition over deep prop-drilling.
3.  **Data Consistency:**
    *   Ensure the UI reflects the single source of truth (DB/URL).
    *   Implement proper cache invalidation after mutations (`revalidatePath`).
4.  **Performance Audit:**
    *   Identify and eliminate unnecessary re-renders in shared context providers.

## Rules

*   **Stay Local:** Keep state as close as possible to where it's used.
*   **No "God Contexts":** Avoid wrapping the entire app in a single massive state object.
*   **Predictability:** State transitions must be explicit and traceable.
*   **URL First:** If a user should be able to share the view, the state belongs in the URL.

## Expected Output

*   Efficient state logic with high responsiveness and low re-render overhead.
