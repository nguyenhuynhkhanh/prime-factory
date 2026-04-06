# Scenario H-05: Double logout returns 200 both times (idempotent)

## Type
edge-case

## Priority
medium — logout must be safe to call multiple times (browser back-button, double-submit)

## Preconditions
- A CTO user is logged in with session id `SESSION_ID`
- First logout has already been performed (session row deleted, cookie cleared)

## Action
Second call to logout with the (now-cleared) cookie value:
```
POST /api/v1/auth/logout
Cookie: __Host-session=SESSION_ID
```

## Expected Outcome
- HTTP 200
- Response indicates success (no error thrown for missing session row)
- The `Set-Cookie` header again clears the `__Host-session` cookie (idempotent clear)
- No 404 or 500 from attempting to delete a non-existent session row

## Notes
D1's `DELETE WHERE id = ?` returns success even if no rows matched. The handler must not check `rowsAffected` to decide whether to return an error.
