# Risks and Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Price Bypass** | High | RLS is activated on all sensitive tables. Critical pricing logic (discounts) is only calculated on the server and verified during checkout session creation. Public endpoints specifically exclude pricing fields. |
| **Stock Race Conditions** | Medium | Use atomic SQL updates with conditions: `UPDATE variants SET stock = stock - qty WHERE id = ? AND stock >= qty`. If 0 rows affected, rollback and notify user. |
| **Stripe Webhook Failure** | High | Use a `stripe_events` table for idempotency. Implement a reconciliation task to check for "Pending" sessions that were paid but not processed. |
| **RLS Leakage** | Medium | Comprehensive testing with different roles (Guest, Level None, level Standard). Never use `supabase-js` service role on the client. |
| **Manual Verification Delay** | Low | Implement clear email notification to admin when new requests arrive and to users when approved. Provide "Contact us" for expedite requests. |
| **Large PDF Exposure** | Low | Use Supabase Storage with private buckets and signed URLs (expire in 60s). Implement rate limiting on resource access endpoints. |
