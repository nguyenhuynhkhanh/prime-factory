# Scenario H-01: Signup transaction rollback — no partial data on failure

## Type
failure-recovery

## Priority
critical — partial data (org without user or user without org) would leave the system in an unrecoverable state

## Preconditions
- Database has an existing user with `email = "conflict@example.com"` (to trigger a D1 constraint error mid-transaction)
- The signup attempt uses the same email to force a transaction failure on the user insert

## Action
```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "conflict@example.com",
  "password": "SomePassword1",
  "orgName": "NewOrg"
}
```

## Expected Outcome
- HTTP 409 (or 500 if the constraint error is not mapped — but must NOT be 201)
- The `orgs` table count does NOT increase (the org insert was rolled back)
- No orphan org row exists in D1

## Failure Mode
If the transaction is not used and the org insert succeeds while the user insert fails, an orphan org exists. This is the failure this scenario guards against.

## Notes
To trigger this reliably in a test environment: seed a user with the same email before the test. The insert failure on `users` must roll back the org insert.
