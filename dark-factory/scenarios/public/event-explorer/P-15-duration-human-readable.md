# Scenario: P-15 — durationMs is rendered as human-readable in the UI

## Type
feature

## Priority
high — raw milliseconds are unreadable at a glance for investigation

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 4 events within the last 7 days with varied durations:
  - Event A: `durationMs = 83000`   (1 minute 23 seconds)
  - Event B: `durationMs = 45000`   (45 seconds)
  - Event C: `durationMs = 500`     (less than 1 second)
  - Event D: `durationMs = null`    (in-flight, no duration)

## Action
User views the Event Explorer page with no filters applied

## Expected Outcome
- The API response includes raw `durationMs` values: `83000`, `45000`, `500`, `null`
- The UI renders durations in the table as:
  - Event A: "1m 23s"
  - Event B: "45s"
  - Event C: "< 1s"
  - Event D: "—"
- No raw millisecond values appear in the rendered table

## Notes
Verifies FR-15. The formatting function `formatDuration(ms)` is a pure UI utility; the API always returns raw `durationMs`. Note: Event D (null durationMs) also applies FR-16 / EC-7 — null duration renders as "—" just as null outcome does, but the spec keeps them as separate concerns (duration null vs. outcome null).
