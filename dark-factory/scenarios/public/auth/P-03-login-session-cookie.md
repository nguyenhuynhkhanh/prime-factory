# Scenario P-03: Successful login sets session cookie with correct attributes

## Type
feature

## Priority
critical — every dashboard request depends on this cookie being set correctly

## Preconditions
- A CTO user exists: `email = "alice@example.com"`, `password = "S3cur3Pass!"`

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
- Response body: `{ "ok": true }`
- Response `Set-Cookie` header contains a cookie named `__Host-session`
- Cookie attributes include: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`
- Cookie does NOT include a `Domain` attribute (required by `__Host-` prefix semantics)
- A row exists in `sessions` with `user_id` matching the CTO's `id` and `expires_at` approximately 7 days from now

## Failure Mode
N/A — success path

## Notes
The `__Host-` prefix is enforced by the browser: cookies without `Secure; Path=/` and no `Domain` will be silently rejected. The spec requires the server to set these attributes correctly.
