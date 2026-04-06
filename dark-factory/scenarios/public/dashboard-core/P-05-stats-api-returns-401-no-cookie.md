# Scenario P-05: Stats API returns 401 for missing session cookie

## Type
feature

## Priority
critical — API auth gate must function independently of the layout gate.

## Preconditions
- No `session` cookie is present in the request.

## Action
```
GET /api/v1/dashboard/stats
```
(No Cookie header)

## Expected Outcome
HTTP 401 with body:
```json
{ "error": "Unauthorized." }
```
- No stats data is returned.
- No D1 queries are executed (auth check must run before any database access).

## Failure Mode
If this returns 200 or any data, the API endpoint is unprotected.

## Notes
The stats route must return 401, not redirect. Redirects are for UI routes (the layout handles those). API routes must return machine-readable status codes so callers like `page.tsx` can handle them programmatically.
