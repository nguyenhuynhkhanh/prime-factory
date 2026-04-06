# Scenario P-11: requireApiKey middleware resolves install identity from Bearer token

## Type
feature

## Priority
critical — every CLI-authenticated route (events, future routes) depends on this

## Preconditions
- An install row exists: `{ id: "INSTALL_UUID", orgId: "ORG_UUID", apiKey: "abcdef...64chars" }`
- A route exists that uses `requireApiKey` (for this test, use `POST /api/v1/events` as the consumer, or a test route)

## Action
Any request to a `requireApiKey`-protected route:
```
POST /api/v1/events
Authorization: Bearer abcdef...64chars
Content-Type: application/json

{ "command": "df-intake", "startedAt": 1700000000 }
```

## Expected Outcome
- The middleware resolves `{ installId: "INSTALL_UUID", orgId: "ORG_UUID" }` successfully
- The route handler receives a valid identity context and can proceed
- `installs.last_seen_at` is updated to approximately now (within a few seconds)
- HTTP response reflects the route logic (not a 401)

## Failure Mode
If the Bearer token is missing or the apiKey is not found in D1, the route returns 401 before any business logic runs.

## Notes
This is an integration-style scenario testing the middleware contract. The exact route used to test this does not matter — what matters is that `requireApiKey` extracts and returns the correct identity.
