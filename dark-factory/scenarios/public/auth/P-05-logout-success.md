# Scenario P-05: Logout deletes session row and clears cookie

## Type
feature

## Priority
high — logout must be a full revocation, not just cookie expiry

## Preconditions
- A CTO user is logged in; session row exists in D1 with id `SESSION_ID`
- Request includes the `__Host-session` cookie with value `SESSION_ID`

## Action
```
POST /api/v1/auth/logout
Cookie: __Host-session=SESSION_ID
```

## Expected Outcome
- HTTP 200
- The `Set-Cookie` response header clears the `__Host-session` cookie (sets `Max-Age=0` or equivalent)
- The session row with id `SESSION_ID` is gone from the `sessions` table
- A subsequent `GET /api/v1/auth/me` with the same cookie value returns 401

## Failure Mode
N/A

## Notes
After logout, the same cookie value must not grant access. The D1 row deletion is the revocation mechanism.
