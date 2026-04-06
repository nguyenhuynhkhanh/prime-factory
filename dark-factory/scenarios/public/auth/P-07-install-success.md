# Scenario P-07: Successful CLI install registration returns API key

## Type
feature

## Priority
critical — the only way a developer CLI gets its API key; no workaround exists

## Preconditions
- An org exists in D1 with `id = "ORG_UUID"`
- No install row exists for `userId = "550e8400-e29b-41d4-a716-446655440000"` (valid UUID v4)
- `API_KEY_SALT` is set to `"test-salt-value"` in the environment
- The HMAC is pre-computed: `HMAC-SHA256("test-salt-value", "550e8400-e29b-41d4-a716-446655440000" + "macbook-pro" + "jdoe")`

## Action
```
POST /api/v1/installs
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "orgId": "ORG_UUID",
  "computerName": "macbook-pro",
  "gitUserId": "jdoe",
  "hmac": "<precomputed-hmac-hex>"
}
```

## Expected Outcome
- HTTP 201
- Response body: `{ "apiKey": "<64-char-hex-string>" }`
- A row exists in `installs` with `id = "550e8400-e29b-41d4-a716-446655440000"`, `org_id = "ORG_UUID"`, `computer_name = "macbook-pro"`, `git_user_id = "jdoe"`, `api_key` matching the returned value
- `installs.hmac` stores the HMAC value from the request
- `installs.last_seen_at` is null (not set at registration time)

## Failure Mode
N/A

## Notes
The returned `apiKey` is 64 hex characters (32 bytes, hex-encoded). It is stored as plaintext in D1.
