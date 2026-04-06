# Scenario H-18: Email case-insensitivity — signup with uppercase email, login with lowercase succeeds

## Type
edge-case

## Priority
high — case-insensitive email is a hard user expectation; mismatch creates ghost duplicate accounts

## Preconditions
- Database is empty

## Action — Step 1: Signup with uppercase email
```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "CTO@Example.COM",
  "password": "ValidPass1",
  "orgName": "CaseOrg"
}
```

## Action — Step 2: Login with lowercase email
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "cto@example.com",
  "password": "ValidPass1"
}
```

## Action — Step 3: Login with original mixed-case email
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "CTO@Example.COM",
  "password": "ValidPass1"
}
```

## Expected Outcome
- Step 1: HTTP 201, user created. In D1, `users.email = "cto@example.com"` (lowercased on write).
- Step 2: HTTP 200, session cookie set. Login with lowercase succeeds.
- Step 3: HTTP 200, session cookie set. Login with original mixed-case succeeds (lowercased before lookup).

## Notes
NFR-4 and EC-1 in the spec. The implementation must `email.toLowerCase()` before both the D1 insert and the D1 lookup.
