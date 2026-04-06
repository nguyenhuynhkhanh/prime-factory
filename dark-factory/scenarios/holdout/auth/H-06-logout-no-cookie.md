# Scenario H-06: Logout with no cookie at all still returns 200

## Type
edge-case

## Priority
medium — ensures logout is robust even when called without a cookie (e.g., from a cleared browser)

## Preconditions
- No `__Host-session` cookie present in the request

## Action
```
POST /api/v1/auth/logout
(no Cookie header)
```

## Expected Outcome
- HTTP 200
- No D1 deletion is attempted (no session id to look up)
- Response body (if any): `{ "ok": true }` or empty — must not be an error

## Notes
This is distinct from H-05 (where the cookie value is present but the row is gone). Here the cookie is entirely absent. The handler must treat this as a no-op and return 200.
