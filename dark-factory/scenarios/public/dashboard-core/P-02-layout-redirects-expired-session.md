# Scenario P-02: Layout redirects expired session to /login

## Type
feature

## Priority
critical — expired sessions must not grant dashboard access.

## Preconditions
- A session row exists in D1 with `expires_at` set to a timestamp in the past (e.g., 1 hour ago).
- The browser sends the corresponding `session=<token>` cookie.

## Action
Navigate to `GET /` (dashboard overview).

## Expected Outcome
- `requireCtoSession` queries D1, finds the session row, but rejects it because `expiresAt <= now`.
- The layout calls `redirect('/login')`.
- The browser receives a 3xx redirect to `/login`.
- No dashboard HTML is rendered.

## Failure Mode
If this test fails, expired sessions bypass the gate — a security regression.

## Notes
The D1 query in `requireCtoSession` should filter with `WHERE id = ? AND expires_at > ?` (Unix seconds). An expired session that passes the time filter is a bug in the session lookup, not in the layout.
