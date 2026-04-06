# Scenario: H-23 — promptText byte length exactly 65,536 is stored without truncation

## Type
edge-case

## Priority
medium — verifies EC-5; the boundary is "exceeds 64 KB", not "equals 64 KB"

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h23"`, `id = "install-h23"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h23
Content-Type: application/json

{
  "command": "df-orchestrate",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "promptText": "<exactly 65,536 ASCII 'A' characters>"
}
```

## Expected Outcome
- HTTP 201
- D1 row `prompt_text` byte length = exactly 65,536 bytes (no truncation applied)
- The full 65,536-character string is stored unchanged

## Notes
An off-by-one truncation (using `> MAX` when should be `>= MAX`, or `>= MAX` when should be `> MAX`)
would either truncate this unnecessarily or fail to truncate at 65,537.
This is the "at the boundary, no truncation" check; H-20 is the "just over, truncation applied" check.
