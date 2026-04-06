# Scenario H-03: Login session cleanup is fire-and-forget — expired session DELETE does not abort login

## Type
failure-recovery

## Priority
high — if cleanup failure aborts login, the CTO is locked out

## Preconditions
- CTO user exists: `email = "alice@example.com"`, `password = "S3cur3Pass!"`
- Two expired session rows exist for this user (expires_at in the past)
- Simulate: the cleanup DELETE fails (e.g., mock D1 to reject the DELETE but accept the INSERT)

## Action
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "S3cur3Pass!"
}
```

## Expected Outcome
- HTTP 200
- `Set-Cookie` header with `__Host-session` is set
- A new session row is created in `sessions`
- Login succeeds regardless of whether the cleanup DELETE succeeded or failed
- The expired session rows may or may not be cleaned up (fire-and-forget is acceptable)

## Failure Mode
If the cleanup DELETE failure propagates and causes login to return an error, this is a bug.

## Notes
Implementation must wrap the cleanup DELETE in a try/catch that swallows the error. The success/failure of cleanup must not be awaited as a condition of the login response.
