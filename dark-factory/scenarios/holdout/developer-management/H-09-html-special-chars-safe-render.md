# Scenario H-09: computerName or gitUserId contains HTML special characters — rendered safely

## Type
edge-case

## Priority
medium — XSS prevention; React JSX default escaping must not be bypassed

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- Install exists with:
  - `computerName = '<script>alert("xss")</script>'`
  - `gitUserId = 'user&admin"role'`

## Action
- Page renders the install row

## Expected Outcome
- The page does NOT execute `alert("xss")` or any injected script
- The browser renders the literal string `<script>alert("xss")</script>` as visible text
  (with HTML entities escaped: `&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;`)
- `gitUserId` is displayed as the literal string `user&admin"role` (with `&amp;` and `&quot;`
  escaping as appropriate)
- No DOM injection occurs

## Failure Mode
N/A

## Notes
- EC-7 coverage.
- React JSX automatically escapes string children, so this should work by default. The risk
  is if any implementation uses `dangerouslySetInnerHTML` for these fields. This scenario
  validates that no such bypass is present.
- Also applies to the `title` attribute used for the tooltip — `title` attributes are safe
  for arbitrary text in all major browsers.
