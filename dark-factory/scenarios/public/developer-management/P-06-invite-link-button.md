# Scenario P-06: Invite link button visible and contains orgId

## Type
feature

## Priority
high — the invite link is the primary CTO action for onboarding new developers

## Preconditions
- CTO is logged in with `orgId = "org-acme"`
- CTO navigates to `/installs` (the Registered Machines page)

## Action
- Page renders in a browser (or via a DOM snapshot / SSR render test)
- CTO clicks or observes the "Copy invite link" button

## Expected Outcome
- A button with accessible label "Copy invite link" (or equivalent) is present above the install
  table
- The button is visible even when the install list is empty
- The invite URL associated with the button is `https://<app-domain>/invite/org-acme`
  (contains the CTO's `orgId`)
- Clicking the button copies that URL to the clipboard (or if clipboard API is unavailable,
  shows the URL in a read-only input)

## Failure Mode
- If `navigator.clipboard` is unavailable, the URL must still be accessible (displayed in a
  selectable input) — the button must not throw an uncaught error.

## Notes
- BR-6 coverage: invite URL is `/invite/<orgId>`.
- The button must appear above the table, not below it or inside a row.
- The page should not require an extra API call to obtain `orgId` — it is available from the
  session that the layout/page already holds.
