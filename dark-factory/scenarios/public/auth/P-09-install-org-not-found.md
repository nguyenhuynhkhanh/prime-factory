# Scenario P-09: Install registration with non-existent orgId returns 404

## Type
feature

## Priority
high — prevents dangling installs that can never send valid telemetry

## Preconditions
- No org exists with `id = "nonexistent-org-id"`
- `API_KEY_SALT` is set and HMAC is correctly computed for these inputs

## Action
```
POST /api/v1/installs
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "orgId": "nonexistent-org-id",
  "computerName": "macbook-pro",
  "gitUserId": "jdoe",
  "hmac": "<correctly-computed-hmac>"
}
```

## Expected Outcome
- HTTP 404
- Response body: `{ "error": "org not found" }`
- No row is inserted into `installs`

## Notes
HMAC verification happens before org lookup. This scenario assumes the HMAC is valid — the 404 is not triggered by HMAC failure but by the org not existing.
