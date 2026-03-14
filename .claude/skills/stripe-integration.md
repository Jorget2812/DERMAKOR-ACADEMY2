# Stripe Integration Skill

**Goal:** Implement secure, reliable, and premium payment experiences using Stripe and bank transfer fallbacks.

## Steps

1.  **Checkout Flow Design:**
    *   Implement `Stripe Checkout` or `Payment Element` for standard payments.
    *   Ensure idempotent transaction IDs to prevent double charging.
    *   Verify all pricing logic (VAT, shipping) matches Stripe's expectation.

2.  **Webhook Engineering:**
    *   Construct robust webhook handlers for `checkout.session.completed`.
    *   Verify signatures for every incoming request.
    *   Implement "Event Deduplication" to handle Stripe's retry logic.

3.  **Subscription & Management:**
    *   Handle `customer.subscription.updated/deleted` events gracefully.
    *   Provide a secure Customer Portal for users to manage their data.

4.  **Error Handling & Fallbacks:**
    *   Log failed payment attempts and reason codes.
    *   Provide clear localized (FR/IT/DE) feedback to users on failure.
    *   Maintain bank transfer flow for users without cards.

## Rules

*   **Signatures Required:** Never process a webhook without signature verification.
*   **Idempotency:** Always use idempotency keys for sensitive API calls.
*   **No PII in Metadata:** Avoid storing sensitive user information in Stripe metadata.
*   **Match Database:** Always sync Stripe status to the local Supabase `orders` table.
*   **Environment Parity:** Rigorously separate test mode and live mode credentials.
