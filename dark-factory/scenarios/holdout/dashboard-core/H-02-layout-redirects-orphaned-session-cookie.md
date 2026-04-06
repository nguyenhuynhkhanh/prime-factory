# Scenario H-02: Layout redirects when session cookie exists but is not in D1

## Type
edge-case

## Priority
high — sessions can be manually deleted from D1 (e.g., by admin cleanup). The layout must not let a dangling cookie through.

## Preconditions
- The browser has a `session=<token>` cookie where `<token>` is a well-formed UUID.
- No row exists in the `sessions` table matching this token (it was deleted from D1).

## Action
Navigate to `GET /` (dashboard overview) with the orphaned session cookie.

## Expected Outcome
- `requireCtoSession` queries D1, finds zero rows, returns a failure result.
- The layout calls `redirect('/login')`.
- The browser is redirected to `/login`.
- No dashboard HTML is rendered.

## Failure Mode
If this renders the dashboard page (even partially), the session validation has a gap.

## Notes
This is EC-1. The cookie value itself is syntactically valid, but the session record no longer exists. The layout must treat "not found in D1" identically to "no cookie".
