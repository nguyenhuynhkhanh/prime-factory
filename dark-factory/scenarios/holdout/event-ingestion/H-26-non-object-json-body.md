# Scenario: H-26 — Valid JSON but non-object body returns 400

## Type
edge-case

## Priority
medium — verifies EC-12; body shape check must gate before field access

## Preconditions
- D1 contains an `installs` row with `apiKey = "test-key-h26"`, `id = "install-h26"`,
  `orgId = "org-xyz"`

## Action

Send three sub-cases:

Sub-case A — JSON null:
```
POST /api/v1/events
Authorization: Bearer test-key-h26
Content-Type: application/json

null
```

Sub-case B — JSON array:
```
POST /api/v1/events
Authorization: Bearer test-key-h26
Content-Type: application/json

["df-intake", "2026-04-06T10:00:00.000Z"]
```

Sub-case C — JSON primitive string:
```
POST /api/v1/events
Authorization: Bearer test-key-h26
Content-Type: application/json

"df-intake"
```

## Expected Outcome
- All three sub-cases return HTTP 400
- Response body for each is a `{ "error": "<string>" }` object (any non-empty error message
  is acceptable — "Invalid JSON" or "Invalid command" are both valid outcomes depending on
  implementation, as long as the status is 400 and no row is inserted)
- No rows inserted for any sub-case

## Notes
When the parsed body is `null` or an array, accessing `body.command` returns `undefined`
in JavaScript. A robust implementation should check `typeof body === "object" && body !== null`
before destructuring. However, since accessing `body.command` on null would throw a TypeError
(which should be caught and returned as 400), any error response with status 400 is acceptable.
The key requirement is that the request does NOT produce a 201 or a 500.
