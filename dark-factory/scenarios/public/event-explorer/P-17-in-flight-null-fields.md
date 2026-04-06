# Scenario: P-17 — In-flight event with null endedAt and durationMs is returned correctly

## Type
feature

## Priority
medium — in-flight events are a real production state; they must not cause query errors

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- 1 event with `endedAt = null`, `durationMs = null`, `outcome = null`, `startedAt` within last 7 days
- The event otherwise has all required fields: `id`, `installId`, `command`, `orgId`, `createdAt`

## Action
```
GET /api/v1/dashboard/events
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- The event appears in the `events` array
- The event object has `"endedAt": null`, `"durationMs": null`, `"outcome": null`
- No error is thrown; the event is not skipped or filtered out
- `pagination.total` includes this event

## Notes
Verifies EC-7. Events from commands that started but haven't finished (or crashed without writing endedAt) are a normal production state. The endpoint must handle nulls in these fields gracefully at the query and response serialisation layer.
