# Scenario P-02: Signup response includes copyable invite link; developer email not shown

## Type
feature

## Priority
high — the invite link is the only mechanism for CLI developers to discover their orgId

## Preconditions
- Database is empty

## Action
```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "cto@startup.io",
  "password": "validPass99",
  "orgName": "StartupIO"
}
```

## Expected Outcome
- HTTP 201
- Response body contains exactly the fields: `{ id, orgId, inviteLink }`
- `inviteLink` matches the pattern `https://<host>/join?org=<uuid>`
- The response body does NOT contain the `email` field
- The `orgId` in the response matches the `orgId` embedded in `inviteLink`

## Notes
The signup page (`app/(auth)/signup/page.tsx`) should display this invite link in a copyable UI element after the API call succeeds. This scenario validates the API contract; a separate UI scenario would validate the frontend rendering.
