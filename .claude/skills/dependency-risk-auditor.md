# Dependency Risk Auditor Skill

**Goal:** Secure the application supply chain and minimize bundle bloat.

## Steps

1.  **Security Scanning:**
    *   Run `npm audit` or equivalent to find known vulnerabilities.
    *   Investigate the maintainability and community trust of new dependencies.
2.  **Size Analysis:**
    *   Analyze the impact of a dependency on the final bundle size.
    *   Evaluate if a dependency can be replaced by a native API or custom utility.
3.  **Conflict Resolution:**
    *   Check for peer dependency conflicts or version mismatches.
    *   Verify compatibility with the current React/Next.js version (React 19).
4.  **Documentation:**
    *   Update `package.json` with strict versioning where necessary.
    *   Document the rationale for adding significant new dependencies.

## Rules

*   **Minimize Dependencies:** If it takes < 5 lines to implement, don't add a package.
*   **Check Licenses:** Ensure dependencies have permissive licenses (MIT, Apache).
*   **Production Ready:** Avoid using experimental or alpha packages without approval.
*   **Audit New Additions:** Every new `npm install` must be audited.

## Expected Output

*   Security-vetted package list and minimized bundle impact assessment.
