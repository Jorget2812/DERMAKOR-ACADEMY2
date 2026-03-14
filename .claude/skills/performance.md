# Performance Skill

**Goal:** Optimize application speed, responsiveness, and efficiency across the entire stack (Next.js, Supabase, Stripe).

## Steps

1.  **Benchmarking:**
    *   Use Chrome DevTools Lighthouse or `next/report-web-vitals` to identify bottlenecks.
    *   Analyze server-side response times (TTFB) and client-side hydration.
    *   Check database query latencies in Supabase dashboard.

2.  **Frontend Optimization:**
    *   Optimize images using `next/image`.
    *   Implement code splitting and dynamic imports for heavy components.
    *   Ensure proper use of Server Components (RSC) vs Client Components.
    *   Minimize main thread blocking during hydration.

3.  **Data Fetching & Caching:**
    *   Implement granular caching strategies (React `cache()`, Next.js `fetch` tags).
    *   Use streaming (`Suspense`) to improve perceived performance.
    *   Optimize Supabase queries (use indexes, avoid N+1 problems).

4.  **Infrastructure & Build:**
    *   Analyze bundle sizes using `next-bundle-analyzer`.
    *   Optimize middleware execution time.
    *   Configure Edge Functions for latency-sensitive tasks.

## Rules

*   **Measure First:** Do not optimize without a baseline measurement.
*   **User Impact:** Prioritize optimizations that affect Core Web Vitals (LCP, FID, CLS).
*   **Consistency:** Maintain performance across all locales and device types.
*   **No Premature Optimization:** Focus on identified bottlenecks.
*   **Verify After:** Always re-measure after applying optimization.
