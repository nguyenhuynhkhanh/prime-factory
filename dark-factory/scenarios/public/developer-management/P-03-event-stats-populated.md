# Scenario P-03: Install with events — eventCount and lastEventAt populated correctly

## Type
feature

## Priority
high — aggregated event stats are a core data point for the CTO

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- Install `id = "install-abc"` exists for org-acme
- Three events exist for `install_id = "install-abc"`:
  - Event 1: `createdAt = 2026-04-01T10:00:00Z`
  - Event 2: `createdAt = 2026-04-02T11:00:00Z`
  - Event 3: `createdAt = 2026-04-03T12:00:00Z` ← most recent

## Action
```
GET /api/v1/dashboard/installs
Headers:
  Cookie: session=<valid-session-id>
```

## Expected Outcome
- HTTP 200
- The object in `installs` for `id = "install-abc"` has:
  - `eventCount`: 3
  - `lastEventAt`: `"2026-04-03T12:00:00.000Z"`

## Failure Mode
N/A

## Notes
- Verifies that `COUNT(events.id)` and `MAX(events.created_at)` are computed correctly in the
  LEFT JOIN GROUP BY query.
