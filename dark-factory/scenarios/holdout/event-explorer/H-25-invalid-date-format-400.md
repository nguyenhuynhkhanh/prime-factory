# Scenario: H-25 — Invalid date format for from/to returns 400

## Type
edge-case

## Priority
medium — invalid dates must be caught before reaching the D1 query

## Preconditions
- CTO authenticated; `orgId = "org-acme"`

## Action (4 separate requests)
```
GET /api/v1/dashboard/events?from=not-a-date
GET /api/v1/dashboard/events?to=2026-13-45T99:00:00Z
GET /api/v1/dashboard/events?from=April+5+2026
GET /api/v1/dashboard/events?from=1743897600
```
(Last one is a Unix timestamp integer — not ISO 8601 format)

## Expected Outcome
- All 4 requests return status 400
- Body: `{ "error": "Invalid date format for from/to" }`
- `Cache-Control: no-store` on each response
- No D1 query is made

## Notes
Verifies the date format validation row in the Error Handling table. The server parses `from`/`to` via `new Date(value)` or equivalent — if the result is `NaN` (Invalid Date), reject with 400. A Unix integer string (`1743897600`) is technically parseable by `new Date()` but the spec requires ISO 8601 strings. The implementation should explicitly check for ISO 8601 format (presence of `T` and `Z` or offset) or at minimum reject values that produce an Invalid Date.
