# Scenario H-02: Duplicate email signup returns 409 with user-readable message

## Type
edge-case

## Priority
high — duplicate email is the most common user-facing error on signup

## Preconditions
- A CTO user exists with `email = "alice@example.com"`

## Action
```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "DifferentPass1",
  "orgName": "Another Org"
}
```

## Expected Outcome
- HTTP 409
- Response body: `{ "error": "email already registered" }`
- No new org row is created
- No new user row is created
- The existing user's org and data are unchanged

## Notes
The `UNIQUE` constraint on `users.email` in D1 will throw a constraint violation. The handler must catch this specific error and return 409 rather than leaking the D1 error message.
