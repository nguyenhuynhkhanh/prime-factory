# Scenario: H-09 — Non-parseable startedAt string returns 400

## Type
edge-case

## Priority
high — garbage date strings must not silently become NaN or epoch in D1

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h09"`, `id = "install-h09"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h09
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "not-a-date"
}
```

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "Invalid startedAt" }`
- No row inserted

## Notes
`new Date("not-a-date").getTime()` returns `NaN`. The implementation must check
`isNaN(new Date(startedAt).getTime())` and reject. If it skips this check, D1 would
receive `NaN` which may cause a silent type error or store `null`.
