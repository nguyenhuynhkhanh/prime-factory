# Scenario: H-07 — Each command enum variant is individually filterable

## Type
edge-case

## Priority
medium — parameter variant coverage: each command value must work independently

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- Exactly 1 event per command type seeded within last 7 days:
  - `command=df-intake`
  - `command=df-debug`
  - `command=df-orchestrate`
  - `command=df-onboard`
  - `command=df-cleanup`

## Action (5 separate requests)
```
GET /api/v1/dashboard/events?command=df-intake
GET /api/v1/dashboard/events?command=df-debug
GET /api/v1/dashboard/events?command=df-orchestrate
GET /api/v1/dashboard/events?command=df-onboard
GET /api/v1/dashboard/events?command=df-cleanup
```

## Expected Outcome
- Each request returns 200
- Each request returns exactly 1 event matching that command
- No request returns events from other commands
- `pagination.total` is 1 for each request

## Notes
Verifies FR-4 (enum validation: all valid values pass), FR-2. This is a parameter variant coverage scenario — must test every enum value, not just one representative.
