# Scenario: P-14 — Empty filter results show correct empty state message

## Type
feature

## Priority
high — empty state prevents the CTO from thinking the page is broken

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 5 events exist for org-acme, all with `command=df-orchestrate`
- No events exist with `command=df-cleanup`

## Action
User navigates to `/events?command=df-cleanup` (or selects `df-cleanup` in the filter bar and waits for debounce)

## Expected Outcome
- API returns 200 with `{ "events": [], "pagination": { "page": 1, "limit": 50, "total": 0, "hasMore": false } }`
- The UI renders NO event rows
- The UI displays the message: "No events match your filters — try widening the date range."
- The filter bar remains visible and interactive (not hidden)
- No error state is shown (this is a valid empty result, not an error)

## Notes
Verifies FR-14. The exact message text must match. This is distinct from the unauthenticated/error state, which should show an error.
