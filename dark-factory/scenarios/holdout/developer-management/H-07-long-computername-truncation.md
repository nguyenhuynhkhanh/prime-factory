# Scenario H-07: Long computerName truncated — full value accessible via tooltip

## Type
edge-case

## Priority
medium — layout safety and accessibility

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- Install exists with:
  - `computerName = "my-very-long-computer-name-that-exceeds-the-column-width-by-a-significant-amount-to-test-truncation"`
  - (exactly 101 characters — well beyond any reasonable column width)
  - `gitUserId = "alice"`

## Action
- Page renders the install row in a browser viewport at standard width (1280px)

## Expected Outcome
- The `computerName` cell does NOT overflow its column — it is visually truncated (ellipsis or
  similar truncation indicator)
- The full `computerName` string is accessible via a tooltip (CSS `title` attribute or equivalent)
  when the user hovers over the cell
- The table layout is not broken (other columns remain visible and properly aligned)

## Failure Mode
N/A

## Notes
- FR-9 and EC-2 coverage.
- Tailwind `truncate` class (`overflow-hidden text-ellipsis whitespace-nowrap`) on the cell is
  the recommended implementation. The `title` attribute should be set to the full `computerName`
  value.
- Same truncation logic should apply to `gitUserId` (holdout H-08 covers the email case).
