# Scenario H-04: Login with unknown email returns 401 with same message as wrong password

## Type
edge-case

## Priority
high — user enumeration prevention; different messages for "no such user" vs "wrong password" would leak account existence

## Preconditions
- No user exists with `email = "notauser@example.com"`

## Action
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "notauser@example.com",
  "password": "AnyPassword"
}
```

## Expected Outcome
- HTTP 401
- Response body: `{ "error": "invalid credentials" }` — identical to the wrong-password response
- No `Set-Cookie` header
- Response timing should not be significantly shorter than the wrong-password case (to prevent timing-based enumeration — ideally still runs through a dummy hash verify or equivalent delay)

## Notes
The "same error message" requirement is functional. The timing requirement is a best-effort security property — at minimum, do not return immediately when the user is not found (run the password hash anyway or add a brief wait).
