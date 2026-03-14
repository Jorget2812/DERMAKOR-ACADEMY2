# Next.js Development Skill

**Goal:** Build high-performance, accessible, and scalable web applications using Next.js 16/React 19 best practices.

## Steps

1.  **Architecture Selection:**
    *   Evaluate if a component should be a Server Component (default) or Client Component (`'use client'`).
    *   Leverage App Router structure for clean routing and nesting.
    *   Use Server Actions for data mutations and safe server-client communication.

2.  **State Management:**
    *   Prefer URL state and React `useOptimistic` for UI responsiveness.
    *   Use React `useActionState` for managing form state and server feedback.
    *   Avoid complex global state (Redux) in favor of shared layouts and React context where necessary.

3.  **Data Fetching:**
    *   Fetch data directly in Server Components where possible.
    *   Implement proper streaming with `Suspense` and `loading.tsx` skeletons.
    *   Use `revalidatePath` or `revalidateTag` to keep data fresh after mutations.

4.  **UI & Styling:**
    *   Use Tailwind CSS for responsive and consistent design.
    *   Prioritize accessibility (ARIA, semantic HTML, Radix UI).
    *   Ensure mobile-first responsiveness (md/lg breakpoints).

## Rules

*   **RSC First:** Keep Client Components as small and nested as possible.
*   **No Direct DB Access in Client:** Logic involving Supabase secrets must stay in Server Components or Actions.
*   **Type Safety:** Ensure strict typing for props, action responses, and Supabase data.
*   **Clean Imports:** Avoid deeply nested relative paths; use `@/` aliases.
*   **Error Boundaries:** Use `error.tsx` at appropriate levels to handle unexpected failures gracefully.
