# Scenario H-08: Install HMAC with correct value but different field order is still valid

## Type
edge-case

## Priority
medium — verifies that the HMAC concatenation order is fixed (not alphabetical or arbitrary)

## Preconditions
- An org exists with `id = "ORG_UUID"`
- `API_KEY_SALT = "test-salt"`
- The HMAC is computed as `HMAC-SHA256("test-salt", userId + computerName + gitUserId)` — this exact order

## Action
```
POST /api/v1/installs
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "orgId": "ORG_UUID",
  "computerName": "dev-machine",
  "gitUserId": "jsmith",
  "hmac": "<HMAC of: '550e8400-e29b-41d4-a716-446655440000' + 'dev-machine' + 'jsmith'>"
}
```

## Expected Outcome
- HTTP 201
- `{ "apiKey": "<64-char-hex>" }`

## Notes
This scenario documents and tests the canonical concatenation order: `userId + computerName + gitUserId`. A HMAC computed in any other order (e.g., `gitUserId + userId + computerName`) must fail.
