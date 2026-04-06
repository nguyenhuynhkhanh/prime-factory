# Scenario H-09: Install registration with duplicate userId returns 409

## Type
edge-case

## Priority
high — re-registration guard; duplicate userId would create a second API key for the same logical machine

## Preconditions
- An org exists with `id = "ORG_UUID"`
- An install row already exists with `id = "550e8400-e29b-41d4-a716-446655440000"`
- `API_KEY_SALT` is set; HMAC is correctly computed

## Action
```
POST /api/v1/installs
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "orgId": "ORG_UUID",
  "computerName": "macbook-pro",
  "gitUserId": "jdoe",
  "hmac": "<correctly-computed-hmac>"
}
```

## Expected Outcome
- HTTP 409
- Response body: `{ "error": "already registered" }`
- No new row is inserted (the existing install row is unchanged)
- The existing `apiKey` is NOT returned in the response

## Notes
The `installs.id` primary key constraint enforces uniqueness. Catch the D1 constraint violation and map to 409. The existing API key must not be returned — the developer must generate a new UUID to re-register.
