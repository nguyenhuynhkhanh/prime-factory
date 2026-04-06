# Scenario H-08: eventsByCommand only contains observed commands (no zero-padding for unobserved)

## Type
edge-case

## Priority
medium — EC-7. Ensuring the response shape matches the contract prevents surprises for consumers.

## Preconditions
- A CTO user has a valid session cookie.
- The org has events for exactly two commands: `df-debug` (3 events) and `df-cleanup` (1 event).
- No events exist for `df-intake`, `df-orchestrate`, or `df-onboard`.

## Action
```
GET /api/v1/dashboard/stats
Cookie: session=<valid-token>
```

## Expected Outcome
HTTP 200 with:
```json
{
  "eventsByCommand": {
    "df-debug": 3,
    "df-cleanup": 1
  },
  ...
}
```
- `eventsByCommand` has exactly 2 keys.
- `df-intake`, `df-orchestrate`, and `df-onboard` are NOT present (not zero-padded).

## Failure Mode
If `df-intake` appears with value 0, the route handler is zero-padding `eventsByCommand` incorrectly (contrast with `eventsByOutcome` which DOES zero-pad all five keys).

## Notes
The asymmetry is intentional: `eventsByOutcome` has a fixed, known enum of outcomes (always show all five). `eventsByCommand` is open-ended — new commands may be added to the CLI — so only observed commands should appear.
