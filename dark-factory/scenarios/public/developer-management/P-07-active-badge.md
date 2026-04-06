# Scenario P-07: Active badge — lastSeenAt within 30 days shows green "Active"

## Type
feature

## Priority
high — the Active/Inactive badge is a core status indicator for the CTO

## Preconditions
- Current server time is 2026-04-06T12:00:00Z (fixed reference point for this test)
- Install `id = "install-recent"` has `lastSeenAt = 2026-04-01T12:00:00Z` (5 days ago — within 30)

## Action
- Page renders the install row for `id = "install-recent"`

## Expected Outcome
- The row displays a green "Active" badge
- The badge text is "Active"

## Failure Mode
N/A

## Notes
- FR-7 coverage: within-30-days → Active.
- The threshold computation happens in the UI component using `Date.now()`. In a test environment,
  mock `Date.now()` to return a fixed epoch corresponding to 2026-04-06T12:00:00Z.
