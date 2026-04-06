# Scenario P-04: Login with wrong password returns 401 without leaking which field failed

## Type
feature

## Priority
critical — incorrect error response would leak user enumeration information

## Preconditions
- A CTO user exists: `email = "alice@example.com"`, `password = "S3cur3Pass!"`

## Action
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "WrongPassword"
}
```

## Expected Outcome
- HTTP 401
- Response body: `{ "error": "invalid credentials" }`
- No `Set-Cookie` header in the response
- No session row is created in D1
- The error message does NOT indicate whether email or password was wrong

## Notes
The same error message ("invalid credentials") must be returned for both wrong password and unknown email. Do not return "user not found" or "incorrect password" separately.
