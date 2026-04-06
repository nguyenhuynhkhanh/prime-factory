# Scenario: H-27 — All valid outcome enum values are accepted

## Type
feature

## Priority
medium — verifies parameter variant coverage for the outcome enum (FR-10)

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h27"`, `id = "install-h27"`,
  `orgId = "org-xyz"`

## Action
Send 4 requests, one for each outcome value:

```
POST /api/v1/events
Authorization: Bearer test-key-h27
{ "command": "df-intake", "startedAt": "2026-04-06T10:00:00.000Z", "outcome": "success" }
```

```
POST /api/v1/events
Authorization: Bearer test-key-h27
{ "command": "df-intake", "startedAt": "2026-04-06T10:00:00.000Z", "outcome": "failed" }
```

```
POST /api/v1/events
Authorization: Bearer test-key-h27
{ "command": "df-intake", "startedAt": "2026-04-06T10:00:00.000Z", "outcome": "blocked" }
```

```
POST /api/v1/events
Authorization: Bearer test-key-h27
{ "command": "df-intake", "startedAt": "2026-04-06T10:00:00.000Z", "outcome": "abandoned" }
```

## Expected Outcome
- All 4 requests return HTTP 201
- D1 `events` table contains 4 rows for `install-h27` with distinct `outcome` values:
  `"success"`, `"failed"`, `"blocked"`, `"abandoned"`
