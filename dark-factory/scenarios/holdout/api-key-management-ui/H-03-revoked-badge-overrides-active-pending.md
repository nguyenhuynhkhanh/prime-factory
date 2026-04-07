# H-03: Revoked badge overrides Active and Pending states

**Spec refs:** BR-1, FR-4, EC-1, EC-2  
**Track:** Track A

## Type
edge-case

## Priority
high — incorrect badge priority would mislead the admin into thinking a revoked install is still active

## Preconditions

Two install rows seeded:

| Row | isActivated | revokedAt | lastSeenAt | Expected badge |
|-----|-------------|-----------|------------|----------------|
| A | `true` | ISO string (not null) | ISO string within last 24 hours | Revoked |
| B | `false` | ISO string (not null) | `null` | Revoked |

Row A represents EC-1: `isActivated=true`, recent `lastSeenAt` (would be Active without revoke), but `revokedAt` is set.

Row B represents EC-2: `isActivated=false` (would be Pending without revoke), but `revokedAt` is set.

## Action

Render the installs page and inspect the Status column.

## Expected Outcome

**Row A:**
- Badge text: "Revoked"
- Badge classes: `bg-red-100 text-red-700`
- NOT "Active" (even though `lastSeenAt` is within 30 days and `isActivated` is true)
- No enabled Revoke button (already revoked)

**Row B:**
- Badge text: "Revoked"
- Badge classes: `bg-red-100 text-red-700`
- NOT "Pending" (even though `isActivated` is false)
- No enabled Revoke button

## Notes

- The badge priority order from FR-4 must be implemented as a conditional chain where `revokedAt IS NOT NULL` is checked FIRST, before any other condition.
- A common implementation bug is checking `isActivated` or computing the 30-day window first, then overlaying revoke state — this can silently produce wrong results if the conditions are evaluated in the wrong order.
- This scenario is holdout because it tests a subtle priority in the badge logic that the code-agent should implement correctly — but we want to verify it independently.
