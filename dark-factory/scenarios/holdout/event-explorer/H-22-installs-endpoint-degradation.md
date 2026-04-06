# Scenario: H-22 — EventFilters degrades gracefully when installs endpoint is unavailable

## Type
failure-recovery

## Priority
medium — installs endpoint is a cross-feature dependency; its failure must not break the page

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- `GET /api/v1/dashboard/installs` is unavailable (returns 500 or times out)
- Events exist and are loaded normally

## Action
User navigates to the Event Explorer page

## Expected Outcome
- The Event Explorer page renders successfully
- The event list loads normally (the installs endpoint failure does not block event loading)
- The `installId` filter dropdown renders empty or shows a fallback state (e.g., "Unable to load installs")
- No JavaScript error is thrown to the user
- No white page or uncaught exception

## Notes
Cross-feature dependency risk noted in spec Dependencies section. The page must not fail entirely if `GET /api/v1/dashboard/installs` is down. The installs dropdown is a convenience filter; its absence should not prevent CTOs from using the rest of the filter bar.
