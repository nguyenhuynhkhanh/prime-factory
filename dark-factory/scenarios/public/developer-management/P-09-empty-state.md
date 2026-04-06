# Scenario P-09: Empty state — zero installs shows correct message

## Type
feature

## Priority
high — empty state is a critical first-run experience; it also shows the invite link CTA

## Preconditions
- Org "acme" exists with `orgId = "org-acme"`
- CTO has a valid session cookie
- No installs exist for org-acme in D1

## Action
```
GET /api/v1/dashboard/installs
Headers:
  Cookie: session=<valid-session-id>
```
Then the page renders with the empty response.

## Expected Outcome
- API: HTTP 200, `{ "installs": [] }`
- UI: page renders without error
- UI: the empty-state message is displayed: "No developers registered yet. Share your invite
  link to get started."
- UI: the "Copy invite link" button is still present above the empty state (so the CTO can
  immediately act on the message)
- UI: no table rows are rendered

## Failure Mode
N/A

## Notes
- EC-6 coverage.
- The invite link button must not disappear when the list is empty — it is the primary CTA in
  the empty state.
