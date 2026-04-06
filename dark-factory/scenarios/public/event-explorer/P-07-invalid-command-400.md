# Scenario: P-07 — Invalid command value returns 400

## Type
feature

## Priority
critical — validation gate on command enum

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- Events may or may not exist — the request must fail before any D1 query

## Action
```
GET /api/v1/dashboard/events?command=df-unknown
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 400
- Body: `{ "error": "Invalid command value" }`
- `Cache-Control: no-store` header present
- No D1 query is made (validation is pre-query)

## Notes
Verifies FR-4. The known command enum from the schema is: df-intake, df-debug, df-orchestrate, df-onboard, df-cleanup. Any other value must be rejected with 400, not silently return empty results.
