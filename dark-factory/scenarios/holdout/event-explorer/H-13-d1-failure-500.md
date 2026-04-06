# Scenario: H-13 — D1 query failure returns 500 and does not expose internals

## Type
failure-recovery

## Priority
critical — database failures must not expose D1 error details or return partial data

## Preconditions
- CTO authenticated; valid session
- D1 database binding is simulated to throw an error on the events query (e.g., timeout, binding misconfiguration)

## Action
```
GET /api/v1/dashboard/events
Cookie: session=<valid-cto-session>
```
(D1 queries throw during `Promise.all()`)

## Expected Outcome
- Status: 500
- Body: `{ "error": "Internal server error" }`
- `Cache-Control: no-store` header present
- No raw D1 error message, stack trace, or SQL text in the response body
- No partial data returned (e.g., events array without pagination, or pagination without events)

## Failure Mode
Both queries fail simultaneously in `Promise.all()` — the `Promise.all()` rejection is caught and mapped to a clean 500 response. If only one query fails (rejected in `Promise.all()`), the `Promise.all()` still rejects and the same clean 500 is returned.

## Notes
Verifies EC-1, EC-2, NFR-6. The `Promise.all([dataQuery, countQuery])` pattern means either query failure causes a full rejection. The catch block must not log D1 internals to the response — only to server logs (where available on Cloudflare edge).
