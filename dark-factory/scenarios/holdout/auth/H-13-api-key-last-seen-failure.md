# Scenario H-13: requireApiKey lastSeenAt failure does not abort the request

## Type
failure-recovery

## Priority
medium — lastSeenAt is telemetry data; a D1 write failure must not take down the CLI

## Preconditions
- An install row exists with a valid `apiKey`
- The `lastSeenAt` update is mocked/forced to throw a D1 error
- A `requireApiKey`-protected route exists (e.g., `POST /api/v1/events`)

## Action
```
POST /api/v1/events
Authorization: Bearer <valid-api-key>
Content-Type: application/json

{ "command": "df-intake", "startedAt": 1700000000 }
```

## Expected Outcome
- The route handler proceeds normally (does not return 500)
- The response is whatever the route normally returns (not a lastSeenAt error)
- `installs.last_seen_at` may or may not be updated (best-effort)
- No error is surfaced to the caller from the failed `lastSeenAt` update

## Failure Mode
If `lastSeenAt` failure propagates to the caller as a 500, this is a bug. The side-effect must be wrapped in try/catch.

## Notes
BR-9 in the spec. The `requireApiKey` implementation must `await` the update inside a try/catch that swallows errors silently (or logs server-side only).
