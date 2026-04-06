# Scenario P-08: Install registration with wrong HMAC returns 403

## Type
feature

## Priority
critical — HMAC verification is the sole integrity check on CLI registration

## Preconditions
- An org exists with `id = "ORG_UUID"`
- `API_KEY_SALT` is set to `"test-salt-value"`

## Action
```
POST /api/v1/installs
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "orgId": "ORG_UUID",
  "computerName": "macbook-pro",
  "gitUserId": "jdoe",
  "hmac": "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
}
```

## Expected Outcome
- HTTP 403
- Response body: `{ "error": "invalid hmac" }`
- No row is inserted into `installs`

## Failure Mode
N/A

## Notes
The `hmac` value above is a valid hex string but is not the correct HMAC for these inputs. The server must reject it before any insert.
