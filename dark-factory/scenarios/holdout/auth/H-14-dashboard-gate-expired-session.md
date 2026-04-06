# Scenario H-14: Dashboard layout redirects to /login when session is expired (cookie present, row exists but expired)

## Type
edge-case

## Priority
high — expired sessions must be treated as invalid by the layout gate, not just by the API

## Preconditions
- CTO user exists
- Session row exists in `sessions` with `expires_at` 1 second in the past
- `__Host-session` cookie is set to this expired session's id

## Action
Browser navigation to a dashboard route:
```
GET /dashboard
Cookie: __Host-session=EXPIRED_SESSION_ID
```

## Expected Outcome
- HTTP 302/307 redirect to `/login`
- The dashboard content is NOT rendered
- The layout must query D1 to verify expiry — reading the cookie alone is insufficient

## Notes
BR-10 in the spec. The layout's session check must include `WHERE expires_at > now()` in the query, not just check for row existence. This tests that the layout implements the same expiry logic as `requireCtoSession`.
