# Code Optimization Skill

**Goal:** Improve algorithmic efficiency, resource management, and execution speed.

## Steps

1.  **Profiling:**
    *   Identify hot paths and resource-intensive operations.
    *   Measure time and memory usage before any change.
2.  **Algorithmic Review:**
    *   Analyze time complexity (Big O) of the current implementation.
    *   Identify redundant computations or inefficient data structures.
3.  **Optimization Strategies:**
    *   Implement memoization or caching for expensive results.
    *   Use more efficient data structures (e.g., Map vs. Object for lookups).
    *   Parallelize independent operations where beneficial.
4.  **Validation:**
    *   Ensure behavioral parity: the optimized code must produce identical results.
    *   Re-measure performance to quantify the improvement.

## Rules

*   **Measure First:** No optimization without a baseline.
*   **Readability vs. Performance:** Maintain balance; avoid "clever" code that is impossible to maintain.
*   **Localize Impact:** Ensure optimization doesn't cause regressions elsewhere.
*   **Verify Parity:** Run comprehensive tests to ensure logic remains unchanged.

## Expected Output

*   Documented performance gain and functionally equivalent, faster code.
