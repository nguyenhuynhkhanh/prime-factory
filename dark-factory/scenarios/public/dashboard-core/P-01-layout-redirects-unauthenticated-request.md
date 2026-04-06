# Scenario P-01: Layout redirects unauthenticated request to /login

## Type
feature

## Priority
critical — the layout session gate protects every current and future dashboard page.

## Preconditions
- No `session` cookie is present in the browser.
- The `(dashboard)` layout exists at `app/(dashboard)/layout.tsx`.

## Action
Navigate to `GET /` (the dashboard overview, which is rendered inside the `(dashboard)` route group).

## Expected Outcome
- The server calls `requireCtoSession`, receives a failed result (no cookie), and calls `redirect('/login')`.
- The browser receives a 3xx redirect response pointing to `/login`.
- No dashboard HTML is rendered or streamed.
- The final URL in the browser is `/login`.

## Failure Mode
If this test fails the session gate is broken and the dashboard is publicly accessible.

## Notes
This scenario must also hold for any other route nested under `(dashboard)` (e.g., `/installs`, `/events`) — the layout wraps all of them.
