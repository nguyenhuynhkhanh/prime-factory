# Scenario P-01: Successful CTO signup creates org and user atomically

## Type
feature

## Priority
critical — the entry point for all CTO onboarding; nothing else works without a valid org + user

## Preconditions
- Database is empty (no users, no orgs)
- `API_KEY_SALT` is set to a valid non-empty string in the Cloudflare environment

## Action
```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "S3cur3Pass!",
  "orgName": "Acme Corp"
}
```

## Expected Outcome
- HTTP 201
- Response body includes `inviteLink` in the form `https://<host>/join?org=<orgId>`
- Response body includes the new user `id` and `orgId`
- Exactly one row exists in `orgs` with `name = "Acme Corp"`
- Exactly one row exists in `users` with `email = "alice@example.com"`, `role = "cto"`, `org_id` matching the org row
- `users.password_hash` is non-empty and NOT equal to the plaintext password
- Both rows have consistent `org_id` values

## Failure Mode
If D1 transaction fails mid-way, neither row should be committed. Recheck that both `orgs` and `users` tables are empty after a forced transaction failure.

## Notes
The `orgId` embedded in the invite link must match the `orgs.id` just created.
