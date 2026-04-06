# Scenario: P-11 — limit is silently capped at 100

## Type
feature

## Priority
high — protects D1 read quota from oversized requests

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 150 events exist for org-acme within the last 7 days

## Action
```
GET /api/v1/dashboard/events?limit=200
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- `events` array contains exactly 100 items (capped, not 200)
- `pagination`:
  ```json
  {
    "page": 1,
    "limit": 100,
    "total": 150,
    "hasMore": true
  }
  ```
- `pagination.limit` reflects the server-applied cap of 100, not the client-requested 200

## Notes
Verifies FR-8, BR-3. The cap is silent — no error, no warning header. The response's `pagination.limit` communicates the actual limit applied.
