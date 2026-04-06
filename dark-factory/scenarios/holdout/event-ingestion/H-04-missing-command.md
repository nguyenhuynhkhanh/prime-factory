# Scenario: H-04 — Missing command field returns 400

## Type
edge-case

## Priority
high — required field; verifies FR-4 for the missing case

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h04"`, `id = "install-h04"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h04
Content-Type: application/json

{
  "startedAt": "2026-04-06T10:00:00.000Z"
}
```
(No `command` field)

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "Invalid command" }`
- No row inserted
