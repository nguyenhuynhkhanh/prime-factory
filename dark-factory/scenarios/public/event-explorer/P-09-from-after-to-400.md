# Scenario: P-09 — from greater than to returns 400

## Type
feature

## Priority
critical — from > to must be a clear error, not a silent empty result

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- Events exist in the db — the request must fail before any D1 query

## Action
```
GET /api/v1/dashboard/events?from=2026-04-10T00:00:00.000Z&to=2026-04-01T00:00:00.000Z
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 400
- Body: `{ "error": "from must not be after to" }`
- `Cache-Control: no-store` header present
- No D1 query is made

## Notes
Verifies FR-6, BR-5. The distinction between 400 and an empty result set is intentional: an inverted date range is a misconfiguration, not a valid filter with no matches. This helps the CTO understand their filter is wrong, not that nothing happened in the "empty" window.
