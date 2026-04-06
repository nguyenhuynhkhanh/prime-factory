# Scenario H-07: Session expired mid-session — GET /api/v1/auth/me returns 401

## Type
edge-case

## Priority
high — session expiry is a normal operational event (after 7 days) and must not return 500

## Preconditions
- CTO user exists
- Session row exists in `sessions` with `expires_at` set to 1 second in the past (already expired)
- `__Host-session` cookie holds the id of this expired session

## Action
```
GET /api/v1/auth/me
Cookie: __Host-session=EXPIRED_SESSION_ID
```

## Expected Outcome
- HTTP 401
- Response body: `{ "error": "unauthorized" }`
- No user data is returned
- No 500 error

## Notes
`requireCtoSession` must check `expires_at > now()` in the D1 query. A session row that exists but is expired must be treated as if it does not exist.
