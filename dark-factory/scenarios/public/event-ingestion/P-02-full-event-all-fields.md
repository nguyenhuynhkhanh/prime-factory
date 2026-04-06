# Scenario: P-02 — Full event with all optional fields is ingested correctly

## Type
feature

## Priority
high — verifies the complete data flow for a fully-populated event row

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-002"`, `id = "install-bbb"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-002
Content-Type: application/json

{
  "command": "df-orchestrate",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "subcommand": "--group",
  "endedAt": "2026-04-06T10:00:45.000Z",
  "durationMs": 45000,
  "outcome": "success",
  "featureName": "checkout-flow",
  "roundCount": 3,
  "promptText": "Implement the checkout flow for the e-commerce site",
  "sessionId": "sess-abc-123"
}
```

## Expected Outcome
- HTTP 201
- Response body: `{ "ok": true, "id": "<uuid>" }`
- D1 row contains:
  - `install_id` = `"install-bbb"`, `org_id` = `"org-xyz"`
  - `command` = `"df-orchestrate"`
  - `subcommand` = `"--group"`
  - `started_at` = 1744185600 (Unix seconds for 2026-04-06T10:00:00Z)
  - `ended_at` = 1744185645 (Unix seconds for 2026-04-06T10:00:45Z)
  - `duration_ms` = 45000
  - `outcome` = `"success"`
  - `feature_name` = `"checkout-flow"`
  - `round_count` = 3
  - `prompt_text` = `"Implement the checkout flow for the e-commerce site"`
  - `session_id` = `"sess-abc-123"`
