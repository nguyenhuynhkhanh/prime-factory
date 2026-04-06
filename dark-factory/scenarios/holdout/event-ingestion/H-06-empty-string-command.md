# Scenario: H-06 — Empty string command returns 400

## Type
edge-case

## Priority
high — verifies FR-4 for empty string (not just missing/unknown); a type-only check
      would pass `""` through if the enum check uses `includes` without a truthy guard

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h06"`, `id = "install-h06"`,
  `orgId = "org-xyz"`

## Action
```
POST /api/v1/events
Authorization: Bearer test-key-h06
Content-Type: application/json

{
  "command": "",
  "startedAt": "2026-04-06T10:00:00.000Z"
}
```

## Expected Outcome
- HTTP 400
- Response body: `{ "error": "Invalid command" }`
- No row inserted

## Notes
A naive enum check of `COMMANDS.includes(command)` would return false for `""` because
`""` is not in the enum. But a developer might short-circuit with `if (!command)` and
hit that branch first. Either implementation must reject empty string. This test catches
the case where a developer uses `command || "default"` coercion instead of strict validation.
