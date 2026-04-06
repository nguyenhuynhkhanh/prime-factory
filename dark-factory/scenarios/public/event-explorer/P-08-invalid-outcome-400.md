# Scenario: P-08 — Invalid outcome value returns 400

## Type
feature

## Priority
critical — validation gate on outcome enum

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- Events may or may not exist — the request must fail before any D1 query

## Action
```
GET /api/v1/dashboard/events?outcome=pending
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 400
- Body: `{ "error": "Invalid outcome value" }`
- `Cache-Control: no-store` header present

## Notes
Verifies FR-5. The known outcome enum from the schema is: success, failed, blocked, abandoned. "pending" is not a valid value. The null outcome (events with no outcome yet) is handled in the data model and accessed without a filter, not via `outcome=null` as a query param.
