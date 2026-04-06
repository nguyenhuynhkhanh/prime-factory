# Scenario P-05: Ordering — null lastSeenAt rows appear last

## Type
feature

## Priority
high — correct ordering is the primary UX expectation for this page

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- Three installs exist for org-acme:
  - Install A: `lastSeenAt = 2026-04-05T10:00:00Z` (most recent)
  - Install B: `lastSeenAt = 2026-03-01T08:00:00Z` (older)
  - Install C: `lastSeenAt = null` (never seen)

## Action
```
GET /api/v1/dashboard/installs
Headers:
  Cookie: session=<valid-session-id>
```

## Expected Outcome
- HTTP 200
- The `installs` array has 3 elements
- Order in the array:
  1. Install A (most recent `lastSeenAt`)
  2. Install B (older `lastSeenAt`)
  3. Install C (`lastSeenAt = null`, last)

## Failure Mode
N/A

## Notes
- D1 (SQLite) `ORDER BY ... NULLS LAST` behaviour must be explicitly specified in the query;
  SQLite does not default to NULLS LAST.
