# Scenario H-17: Password of 1001 characters returns 400 before hashing at both signup and login

## Type
edge-case

## Priority
high — a 1001+ char password sent to PBKDF2 at 100K iterations would stall the Workers isolate

## Preconditions
- For login test: a CTO user exists (email: "alice@example.com")
- For signup test: database may be empty

## Action A — Signup
```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "new@example.com",
  "password": "<string of exactly 1001 characters>",
  "orgName": "TestOrg"
}
```

## Action B — Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "<string of exactly 1001 characters>"
}
```

## Expected Outcome (both actions)
- HTTP 400
- Response body: `{ "error": "password too long" }`
- No hashing is performed (the handler returns before calling `hashPassword` or `verifyPassword`)
- No D1 writes occur (for signup: no org or user row created)

## Notes
NFR-3 in the spec. EC-2 covers the boundary (1000 = accepted, 1001 = rejected). The length check must occur as the FIRST validation step before any crypto operation.
