# Scenario H-06: lastEventAt non-null but lastSeenAt null — no crash

## Type
edge-case

## Priority
medium — data inconsistency from a prior bug must not crash the UI

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- Install `id = "install-weird"` exists with:
  - `lastSeenAt = null` (never updated by auth middleware)
  - Three events exist for this install, most recent at `2026-03-15T10:00:00Z`
  - `eventCount` will therefore be 3 and `lastEventAt` will be `"2026-03-15T10:00:00.000Z"`

## Action
```
GET /api/v1/dashboard/installs
Headers:
  Cookie: session=<valid-session-id>
```

## Expected Outcome
- HTTP 200
- The row for `id = "install-weird"` returns:
  - `lastSeenAt`: null
  - `eventCount`: 3
  - `lastEventAt`: `"2026-03-15T10:00:00.000Z"`
- The UI renders:
  - "Last Seen" column: "Never" (not a crash, not "null")
  - "Last Event" column: `"2026-03-15T10:00:00.000Z"` (or a formatted version thereof)
  - Badge: grey "Inactive" (null lastSeenAt → always inactive, regardless of events)

## Failure Mode
N/A

## Notes
- EC-9 coverage.
- This data state is unusual but possible if `lastSeenAt` was not being updated in an early
  version of the auth middleware. The UI must be independently null-safe on both `lastSeenAt`
  and `lastEventAt`.
