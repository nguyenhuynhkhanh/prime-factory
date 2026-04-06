# Scenario P-04: Install with zero events — appears in list with zeroed stats and null lastSeenAt renders as "Never"

## Type
feature

## Priority
high — verifies LEFT JOIN behaviour and null-safety in the UI

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- Install `id = "install-new"` exists for org-acme:
  - `computerName = "fresh-machine"`, `gitUserId = "carol"`
  - `createdAt = 2026-04-05T08:00:00Z`
  - `lastSeenAt = null` (never been seen)
- No events exist for `install_id = "install-new"` in the `events` table

## Action
```
GET /api/v1/dashboard/installs
Headers:
  Cookie: session=<valid-session-id>
```

## Expected Outcome
- HTTP 200
- The `installs` array contains an object for `id = "install-new"` with:
  - `eventCount`: 0
  - `lastEventAt`: null
  - `lastSeenAt`: null
- The UI renders this row with "Never" in the "Last Seen" column (not the string "null",
  not empty, not a crash)
- The row is still present in the list (LEFT JOIN, not INNER JOIN)

## Failure Mode
N/A

## Notes
- EC-4 coverage: zero-event install does not crash the API or the UI renderer.
- EC-9 is a related holdout scenario that covers the inverse: `lastEventAt` non-null but
  `lastSeenAt` null.
