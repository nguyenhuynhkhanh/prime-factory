# Scenario H-19: Concurrent signup with same email — exactly one succeeds, one returns 409

## Type
concurrency

## Priority
medium — race condition on signup; D1 unique constraint is the final arbiter

## Preconditions
- Database is empty (no user with `email = "race@example.com"`)

## Action
Two simultaneous requests sent as close together as possible:

Request A:
```
POST /api/v1/auth/signup
Content-Type: application/json
{ "email": "race@example.com", "password": "PassA1", "orgName": "OrgA" }
```

Request B (sent simultaneously):
```
POST /api/v1/auth/signup
Content-Type: application/json
{ "email": "race@example.com", "password": "PassB2", "orgName": "OrgB" }
```

## Expected Outcome
- Exactly one request returns HTTP 201
- The other request returns HTTP 409 with `{ "error": "email already registered" }`
- Exactly one row exists in `users` for `email = "race@example.com"`
- Exactly one row exists in `orgs` (corresponding to the successful signup)
- No orphan org rows exist from the losing transaction

## Failure Mode
If both requests return 201, there are two users with the same email (data integrity violation). If one request returns 500 instead of 409, the constraint error is not being caught.

## Notes
EC-7 in the spec. D1 serialises writes, so one transaction will commit and the other will fail with a unique constraint violation on `users.email`. The important thing is that the losing transaction fully rolls back (including the `orgs` insert).
