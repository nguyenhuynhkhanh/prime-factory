# Scenario: H-07 — Each valid command enum value is accepted

## Type
feature

## Priority
medium — verifies parameter variant coverage: all 5 enum values must be accepted

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h07"`, `id = "install-h07"`,
  `orgId = "org-xyz"`

## Action
Send 5 separate requests, one for each command value:

Request 1:
```
POST /api/v1/events
Authorization: Bearer test-key-h07
{ "command": "df-intake",      "startedAt": "2026-04-06T10:00:00.000Z" }
```

Request 2:
```
POST /api/v1/events
Authorization: Bearer test-key-h07
{ "command": "df-debug",       "startedAt": "2026-04-06T10:00:00.000Z" }
```

Request 3:
```
POST /api/v1/events
Authorization: Bearer test-key-h07
{ "command": "df-orchestrate", "startedAt": "2026-04-06T10:00:00.000Z" }
```

Request 4:
```
POST /api/v1/events
Authorization: Bearer test-key-h07
{ "command": "df-onboard",     "startedAt": "2026-04-06T10:00:00.000Z" }
```

Request 5:
```
POST /api/v1/events
Authorization: Bearer test-key-h07
{ "command": "df-cleanup",     "startedAt": "2026-04-06T10:00:00.000Z" }
```

## Expected Outcome
- All 5 requests return HTTP 201
- D1 `events` table contains 5 rows for `install-h07`, one per command value
