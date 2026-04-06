# Scenario H-21: Signup with empty or whitespace-only orgName returns 400

## Type
edge-case

## Priority
medium — empty org names create unusable org records and confusing dashboard displays

## Preconditions
- Database is empty (or at least no prior user with test email)

## Action A — empty orgName
```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "cto@example.com",
  "password": "ValidPass1",
  "orgName": ""
}
```

## Action B — whitespace-only orgName
```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "cto@example.com",
  "password": "ValidPass1",
  "orgName": "   "
}
```

## Expected Outcome (both actions)
- HTTP 400
- Response body: `{ "error": "missing required fields" }` (or equivalent field-specific error)
- No org row is created
- No user row is created

## Notes
EC-11 in the spec. The validation must trim whitespace before checking for emptiness: `orgName.trim().length === 0` should fail. An org named `"   "` stored in D1 would appear blank in the dashboard.
