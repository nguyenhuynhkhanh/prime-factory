# Scenario H-05: Active/Inactive boundary — exactly 30 days ago is Inactive

## Type
edge-case

## Priority
high — boundary precision prevents flickering badge on repeated page loads at the threshold

## Preconditions
- Current time (mocked): 2026-04-06T12:00:00.000Z
- 30 days before that: 2026-03-07T12:00:00.000Z
- Three installs:
  - Install A: `lastSeenAt = 2026-04-06T11:59:59.999Z` (1 ms before now → within 30 days → Active)
  - Install B: `lastSeenAt = 2026-03-07T12:00:00.000Z` (exactly 30 days ago → Inactive per EC-3)
  - Install C: `lastSeenAt = 2026-03-07T11:59:59.999Z` (1 ms beyond 30 days → Inactive)

## Action
- Page renders all three install rows with `Date.now()` mocked to `2026-04-06T12:00:00.000Z`

## Expected Outcome
- Install A: green "Active" badge
- Install B: grey "Inactive" badge (boundary is exclusive — exactly 30 days ago is NOT active)
- Install C: grey "Inactive" badge

## Failure Mode
N/A

## Notes
- EC-3 and BR-3 coverage.
- The threshold expression must be `lastSeenAt < now - 30d` (strict less-than), not `<=`.
  This means at exactly 30 days, the machine is Inactive, preventing flip-flopping on page
  reload at the exact boundary second.
- This is a holdout scenario because the boundary direction (inclusive vs exclusive at exactly
  30 days) is a design decision the code-agent must make correctly from the spec wording.
