# Scenario: H-25 — Optional free-text fields with empty strings are stored as-is

## Type
edge-case

## Priority
low — verifies EC-9; empty strings in free-text optional fields should be stored, not rejected

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h25"`, `id = "install-h25"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h25
Content-Type: application/json

{
  "command": "df-intake",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "subcommand": "",
  "featureName": "",
  "sessionId": ""
}
```

## Expected Outcome
- HTTP 201
- D1 row:
  - `subcommand` = `""` (empty string, not NULL)
  - `feature_name` = `""` (empty string, not NULL)
  - `session_id` = `""` (empty string, not NULL)

## Notes
These fields have no enum constraint. Storing an empty string is valid.
The implementation should not apply the `command` empty-string rejection logic to
free-text optional fields.
