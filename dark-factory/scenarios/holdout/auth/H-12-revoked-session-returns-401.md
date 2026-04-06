# Scenario H-12: requireCtoSession returns 401 when session row has been deleted (cookie present but row gone)

## Type
edge-case

## Priority
high — revocation (logout from another tab/device) must be honoured; stale cookie must not grant access

## Preconditions
- CTO user exists
- Session row has been deleted from D1 (simulates logout from another tab)
- `__Host-session` cookie is still set in the browser to the old session id

## Action
```
GET /api/v1/auth/me
Cookie: __Host-session=DELETED_SESSION_ID
```

## Expected Outcome
- HTTP 401
- Response body: `{ "error": "unauthorized" }`
- No user data is returned
- No 500 error (missing row must not throw — just return null from the query)

## Notes
The implementation must treat `null` from the session query as a 401, not as an error. This is EC-4 in the spec.
