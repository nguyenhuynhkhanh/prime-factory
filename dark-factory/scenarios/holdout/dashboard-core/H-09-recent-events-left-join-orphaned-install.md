# Scenario H-09: Recent events LEFT JOIN — orphaned event (install deleted) does not crash or drop

## Type
edge-case

## Priority
medium — EC-6. Data integrity gaps in D1 should not crash the dashboard.

## Preconditions
- A CTO user has a valid session cookie.
- The org has 2 events:
  - Event A: references `install_id = "install-exists"` — the install row exists with `computer_name = "macbook-alice"`.
  - Event B: references `install_id = "install-deleted"` — no row in `installs` table matches this ID (orphaned).

## Action
```
GET /api/v1/dashboard/stats
Cookie: session=<valid-token>
```

## Expected Outcome
HTTP 200 (no crash). `recentEvents` contains both events:
```json
{
  "recentEvents": [
    {
      "id": "event-b-id",
      "installId": "install-deleted",
      "computerName": null,
      "gitUserId": null,
      "command": "df-intake",
      "outcome": "success",
      "createdAt": "..."
    },
    {
      "id": "event-a-id",
      "installId": "install-exists",
      "computerName": "macbook-alice",
      "gitUserId": "alice@example.com",
      "command": "df-debug",
      "outcome": "success",
      "createdAt": "..."
    }
  ]
}
```
- Event B is included with `computerName: null` and `gitUserId: null`.
- The response does NOT omit Event B.
- No 500 error.

## Failure Mode
- If Event B is missing: the query uses INNER JOIN instead of LEFT JOIN.
- If the route returns 500: null values from the LEFT JOIN are not handled in the TypeScript serialization logic.

## Notes
The query must use `LEFT JOIN installs i ON e.install_id = i.id`. The TypeScript type for `recentEvents` items must allow `computerName: string | null` and `gitUserId: string | null`.
