# Scenario H-05: Concurrent requests from same CTO do not interfere

## Type
concurrency

## Priority
medium — Cloudflare Workers handle concurrent requests in separate isolates; shared server state must not exist.

## Preconditions
- A CTO user has a valid session cookie.
- The org has substantial data (e.g., 100+ events) to make queries take non-trivial time.

## Action
Send two simultaneous `GET /api/v1/dashboard/stats` requests from the same session cookie (simulating two open tabs or a slow network retry).

## Expected Outcome
- Both requests complete independently and return HTTP 200 with identical (or equally valid) data.
- Neither request causes the other to fail with a 500 or receive partial data.
- No race condition on D1 — the three queries in each request run in their own `Promise.all`, isolated from the other request's queries.

## Failure Mode
If one request fails due to the other, there is shared mutable server state — which should not exist in a stateless Worker environment.

## Notes
This is effectively a sanity check. Cloudflare Workers are stateless and isolated; this scenario is most useful for catching accidentally introduced module-level mutable state (e.g., a result cache variable at module scope).
