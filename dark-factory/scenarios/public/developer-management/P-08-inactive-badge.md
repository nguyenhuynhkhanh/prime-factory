# Scenario P-08: Inactive badge — null lastSeenAt and old lastSeenAt both show grey "Inactive"

## Type
feature

## Priority
high — null-safety and inactive state are both covered here

## Preconditions
- Current server time reference: 2026-04-06T12:00:00Z
- Two installs exist:
  - Install A: `lastSeenAt = null`
  - Install B: `lastSeenAt = 2026-02-01T12:00:00Z` (64 days ago — beyond 30 days)

## Action
- Page renders both install rows

## Expected Outcome
- Install A row shows a grey "Inactive" badge (BR-4: null → always inactive)
- Install B row shows a grey "Inactive" badge (lastSeenAt > 30 days ago)
- Neither row shows "Active"
- Neither row crashes the renderer

## Failure Mode
N/A

## Notes
- BR-4 coverage for null case; FR-7 coverage for the >30-day case.
- The `isActive` check must explicitly handle `null` before comparing dates. If `lastSeenAt ===
  null`, the badge is Inactive without any date arithmetic.
