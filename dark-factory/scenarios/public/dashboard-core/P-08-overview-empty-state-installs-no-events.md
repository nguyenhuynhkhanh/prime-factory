# Scenario P-08: Overview page renders empty state for org with installs but zero events

## Type
feature

## Priority
high — distinguishes "not set up" from "set up but quiet". Different message, different meaning.

## Preconditions
- A CTO user exists with a valid session cookie.
- The org has 2 installs, both with `last_seen_at` within the last 30 days (active).
- The org has zero rows in the `events` table.
- Stats API returns `{ "activeInstalls": 2, "totalEvents": 0, "recentEvents": [], "eventsByOutcome": { "success": 0, "failed": 0, "blocked": 0, "abandoned": 0, "unknown": 0 }, "eventsByCommand": {} }`.

## Action
Navigate to the dashboard overview page.

## Expected Outcome
- The page renders successfully.
- The page contains the text "Developers registered but no events yet."
- The active installs count shows "2" (or equivalent).
- The page does NOT show "Share your invite link to get developers registered." (that is the other empty state).

## Failure Mode
If the wrong message is shown, or both messages are shown, the empty state branching logic is broken.

## Notes
`page.tsx` detects this state with: `stats.activeInstalls > 0 && stats.totalEvents === 0`. The two empty state conditions are mutually exclusive.
