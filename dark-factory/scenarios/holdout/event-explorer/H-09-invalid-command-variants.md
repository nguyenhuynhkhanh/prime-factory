# Scenario: H-09 — Each invalid command variant returns 400

## Type
edge-case

## Priority
medium — exhaustive negative enum coverage for command

## Preconditions
- CTO authenticated; `orgId = "org-acme"`

## Action (multiple requests with invalid command values)
```
GET /api/v1/dashboard/events?command=
GET /api/v1/dashboard/events?command=df-ORCHESTRATE
GET /api/v1/dashboard/events?command=orchestrate
GET /api/v1/dashboard/events?command=df_orchestrate
GET /api/v1/dashboard/events?command=%3Cscript%3E
```

## Expected Outcome
- Every request returns status 400
- Body for each: `{ "error": "Invalid command value" }`
- `Cache-Control: no-store` on each response
- No D1 query is made for any of these requests

## Notes
Verifies FR-4 with adversarial inputs. Key checks: empty string is invalid; case-sensitivity matters (`df-ORCHESTRATE` != `df-orchestrate`); underscore vs. hyphen; URL-encoded injection attempt. Note: an empty `command=` param (empty string) should either be treated as "no filter applied" (omitted) or as an invalid value returning 400. The spec specifies validation against the known enum — an empty string is not in the enum, so 400 is correct.
