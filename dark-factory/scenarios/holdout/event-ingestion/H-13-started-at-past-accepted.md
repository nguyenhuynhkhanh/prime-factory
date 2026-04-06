# Scenario: H-13 — startedAt in the past (24 hours ago) is accepted

## Type
edge-case

## Priority
medium — the future-timestamp guard must not accidentally reject past timestamps

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h13"`, `id = "install-h13"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h13
Content-Type: application/json

{
  "command": "df-debug",
  "startedAt": "2026-04-05T10:00:00.000Z"
}
```
(24 hours in the past relative to the nominal test date of 2026-04-06)

## Expected Outcome
- HTTP 201
- Row inserted with `started_at` = Unix timestamp for 2026-04-05T10:00:00Z

## Notes
The only future-direction guard is BR-3 (> 1 hour ahead). There is no minimum on how
far in the past `startedAt` can be. An implementation that checks the absolute distance
rather than the future direction would incorrectly reject this.
