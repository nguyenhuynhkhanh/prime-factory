# Scenario: H-11 — startedAt exactly at now + 1 hour boundary is accepted

## Type
edge-case

## Priority
medium — verifies EC-1; the rule is strictly > 1 hour, so the boundary itself is valid

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h11"`, `id = "install-h11"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h11
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "<ISO string for server_now + exactly 3600 seconds>"
}
```

(The test harness must compute `startedAt` as `new Date(Date.now() + 3600_000).toISOString()`
just before sending, so the request arrives while the timestamp is still at or under the boundary.)

## Expected Outcome
- HTTP 201
- Row inserted with the provided `started_at` value

## Notes
This is a boundary-value test. Off-by-one in the implementation (using `>=` instead of `>`)
would cause this to return 400. The test is in holdout because it requires precise timing.
