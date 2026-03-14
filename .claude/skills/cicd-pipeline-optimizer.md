# CI/CD Pipeline Optimizer Skill

**Goal:** Speed up, secure, and automate the deployment lifecycle.

## Steps

1.  **Build Optimization:**
    *   Identify slow steps in the build process (`npm run build`).
    *   Implement caching for dependencies and build artifacts.
2.  **Security Integration:**
    *   Integrate automated security scans (SAST, secret detection).
    *   Ensure tests run automatically before every merge.
3.  **Environment Management:**
    *   Audit environment variable injection for different stages (Prod, Preview).
    *   Verify deployment health checks and rollback mechanisms.
4.  **Automation:**
    *   Automate repetitive tasks (versioning, changelog generation).
    *   Configure Vercel/GitHub actions for optimal performance.

## Rules

*   **Fail Early:** Run the fastest checks (lint, types) first.
*   **Isolate Secrets:** Ensure CI/CD secrets are never exposed in logs.
*   **Consistency:** Deployment must be reproducible in all environments.
*   **Build Once:** Avoid redundant builds across pipeline stages.

## Expected Output

*   Faster build times and hardened deployment automation.
