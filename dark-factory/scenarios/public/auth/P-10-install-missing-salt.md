# Scenario P-10: Install registration with missing API_KEY_SALT returns 500

## Type
feature

## Priority
critical — misconfiguration must be surfaced loudly, not silently bypass security

## Preconditions
- An org exists with `id = "ORG_UUID"`
- `API_KEY_SALT` environment variable is NOT set (undefined or absent from the Cloudflare env)

## Action
```
POST /api/v1/installs
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "orgId": "ORG_UUID",
  "computerName": "macbook-pro",
  "gitUserId": "jdoe",
  "hmac": "any-value-here"
}
```

## Expected Outcome
- HTTP 500
- Response body: `{ "error": "server misconfiguration" }`
- No row is inserted into `installs`
- The response body does NOT contain a stack trace or the internal error message

## Notes
This must be checked at request time (inside the handler), not at module load time, because `getCloudflareContext()` is only valid inside a request handler. The check is: if `!env.API_KEY_SALT` (empty string or undefined), return 500 immediately.
