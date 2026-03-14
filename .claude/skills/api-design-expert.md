# API Design Expert Skill

**Goal:** Create robust, scalable, and well-documented API contracts (REST, Server Actions).

## Steps

1.  **Contract Definition:**
    *   Define clear request/response shapes using TypeScript/Zod.
    *   Use consistent naming conventions (camelCase, semantic paths).
2.  **Security Engineering:**
    *   Implement rate limiting and authentication guards for every route.
    *   Validate all inputs strictly before processing.
3.  **Error Handling:**
    *   Ensure consistent error response formats (status codes, messaging).
    *   Handle edge cases (timeout, missing data, server failure) gracefully.
4.  **Documentation:**
    *   Document API endpoints with TSDoc or OpenAPI spec if required.
    *   Provide clear examples of request payloads and success/error responses.

## Rules

*   **Stateful Actions:** Server Actions must validate the session at the start.
*   **Idempotency:** Designing for idempotent operations where possible.
*   **Version Safety:** Consider breaking changes when modifying existing APIs.
*   **No Sensitive Leakage:** Never return sensitive database fields in responses.

## Expected Output

*   Secured, documented, and strictly typed API implementation.
