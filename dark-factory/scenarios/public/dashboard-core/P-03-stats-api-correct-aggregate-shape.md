# Scenario P-03: Stats API returns correct aggregate shape for org with data

## Type
feature

## Priority
critical — core data contract for the dashboard overview page.

## Preconditions
- A CTO user exists with a valid, unexpired session cookie.
- The org has 3 installs, all with `last_seen_at` within the last 30 days.
- The org has 20 events total:
  - 10 events with `command = "df-intake"`, `outcome = "success"`
  - 5 events with `command = "df-debug"`, `outcome = "failed"`
  - 5 events with `command = "df-intake"`, `outcome = "blocked"`

## Action
```
GET /api/v1/dashboard/stats
Cookie: session=<valid-token>
```

## Expected Outcome
HTTP 200 with body:
```json
{
  "activeInstalls": 3,
  "totalEvents": 20,
  "eventsByOutcome": {
    "success": 10,
    "failed": 5,
    "blocked": 5,
    "abandoned": 0,
    "unknown": 0
  },
  "eventsByCommand": {
    "df-intake": 15,
    "df-debug": 5
  },
  "recentEvents": [ ... ]
}
```
- `recentEvents` contains at most 10 items.
- All items belong to this org.
- Items are ordered newest `createdAt` first.
- `totalEvents` equals 20 (sum of all events, same as sum of all `eventsByOutcome` values).

## Failure Mode
N/A — data reads; no partial state.

## Notes
`eventsByCommand` must only contain keys for commands that have at least one event. `df-orchestrate`, `df-onboard`, `df-cleanup` must not appear.
