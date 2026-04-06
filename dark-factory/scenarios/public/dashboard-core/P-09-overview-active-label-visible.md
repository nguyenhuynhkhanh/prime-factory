# Scenario P-09: Overview page displays "Active in last 30 days" label

## Type
feature

## Priority
medium — prevents CTO confusion about what "active" means.

## Preconditions
- A CTO user exists with a valid session cookie.
- The org has at least 1 active install and at least 1 event.

## Action
Navigate to the dashboard overview page.

## Expected Outcome
- The page renders the active installs count.
- Adjacent to (or below) that count, a visible label is rendered containing text that conveys the 30-day definition — e.g., "Active in last 30 days" or "Active developers (last 30 days)".
- The label is part of the rendered HTML (visible to screen readers and text search — not only visual styling).

## Failure Mode
If no such label is present in the rendered output, the acceptance criterion AC-8 is not met.

## Notes
The exact wording is flexible, but the label must include a reference to the 30-day window. It must be rendered on the server (not injected client-side after hydration) so it appears in the initial HTML.
