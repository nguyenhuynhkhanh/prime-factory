# Scenario H-11: API_KEY_SALT set to empty string returns 500

## Type
edge-case

## Priority
high — empty string is a common misconfiguration that must not silently allow HMAC bypass

## Preconditions
- An org exists with `id = "ORG_UUID"`
- `API_KEY_SALT` is set to `""` (empty string) in the Cloudflare environment

## Action
```
POST /api/v1/installs
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "orgId": "ORG_UUID",
  "computerName": "macbook-pro",
  "gitUserId": "jdoe",
  "hmac": "any-value"
}
```

## Expected Outcome
- HTTP 500
- Response body: `{ "error": "server misconfiguration" }`
- No install row is created
- Stack trace is NOT in the response body

## Notes
The check is: `if (!env.API_KEY_SALT)` — an empty string is falsy in JavaScript. This is the same guard as for an undefined/missing salt. EC-9 in the spec.
