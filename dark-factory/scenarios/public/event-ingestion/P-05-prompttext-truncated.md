# Scenario: P-05 — promptText exceeding 64 KB is truncated silently; response is 201

## Type
feature

## Priority
high — verifies BR-5 and FR-11; incorrect behavior would cause CLI errors on large prompts

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-005"`, `id = "install-eee"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-005
Content-Type: application/json

{
  "command": "df-orchestrate",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "promptText": "<string of exactly 70,000 ASCII characters>"
}
```

(Build the promptText value as a string of 70,000 repetitions of the character `"A"`,
which is 70,000 UTF-8 bytes.)

## Expected Outcome
- HTTP 201 (no 400; truncation is silent)
- Response body: `{ "ok": true, "id": "<uuid>" }`
- D1 row `prompt_text` byte length = exactly 65,536 bytes
- D1 row `prompt_text` = first 65,536 characters of the original string (all `"A"`)

## Notes
Verifies that the route does NOT return an error for oversized promptText.
The code-agent must handle truncation before the D1 insert, not rely on D1 to reject it.
