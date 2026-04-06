# Scenario: H-17 — computerName and gitUserId are sourced from installs JOIN, not events table

## Type
edge-case

## Priority
medium — verifies the JOIN is actually happening, not falling back to events columns

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- Install `install-1`: `computerName="alice-macbook-pro"`, `gitUserId="alice@company.com"` — note the exact values
- 1 event with `installId=install-1`, within last 7 days
- The `events` table does NOT have a `computerName` or `gitUserId` column (per schema)

## Action
```
GET /api/v1/dashboard/events
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- The event in the response has:
  - `"computerName": "alice-macbook-pro"` (from `installs` table JOIN)
  - `"gitUserId": "alice@company.com"` (from `installs` table JOIN)
- These values match the `installs` record, not any field on the `events` table

## Variation — EC-14 coverage
If `installs.computerName` is an empty string `""`, the API returns `"computerName": ""`. No substitution is performed. This is a data integrity issue, not an API concern.

## Notes
Verifies BR-8, EC-14. The JOIN is `INNER JOIN installs ON events.install_id = installs.id`. Without the JOIN, `computerName` and `gitUserId` would not exist in the response at all (they are not on the `events` table).
