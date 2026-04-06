# Scenario H-08: gitUserId is an email address — renders as plain text, no mailto link

## Type
edge-case

## Priority
medium — prevents unintended mailto: links that could confuse CTOs or trigger unintended behaviour

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- Install exists with `gitUserId = "alice@company.com"`

## Action
- Page renders the install row

## Expected Outcome
- The `gitUserId` cell renders the text `alice@company.com` as a plain string
- The cell does NOT render an `<a href="mailto:alice@company.com">` link
- The cell does NOT render an `<a href="https://...">` link
- Hovering over the cell does not navigate the browser

## Failure Mode
N/A

## Notes
- EC-1 coverage.
- Some UI frameworks or markdown renderers auto-link email addresses. The implementation must use
  a plain text node (or `<span>`) for `gitUserId`, never pass it through an auto-linking renderer,
  and never use `dangerouslySetInnerHTML`.
