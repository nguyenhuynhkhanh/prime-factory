# Scenario P-07: Overview page renders empty state for org with zero installs

## Type
feature

## Priority
high — new org onboarding UX. A blank page with no message would be confusing.

## Preconditions
- A CTO user exists with a valid session cookie.
- The org has zero rows in the `installs` table.
- The org has zero rows in the `events` table.
- Stats API returns `{ "activeInstalls": 0, "totalEvents": 0, "recentEvents": [], ... }`.

## Action
Navigate to the dashboard overview page (e.g., `GET /` within the `(dashboard)` route group).

## Expected Outcome
- The page renders successfully (HTTP 200 for the page itself).
- The page contains the text "Share your invite link to get developers registered."
- Stat cards are either hidden or show "0" values — no crash, no unhandled exception.
- No "Developers registered but no events yet." message is shown (that message is for the other empty state).

## Failure Mode
If the page crashes or shows an unhandled error instead of the message, the empty state is broken.

## Notes
`page.tsx` detects this state by checking `stats.activeInstalls === 0`. This check covers both "zero installs ever" and "zero active installs" — which are functionally the same from a UX perspective: the org needs to onboard developers.
