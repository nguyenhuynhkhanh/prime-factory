# Scenario H-01: Stats API returns 401 for malformed session cookie value

## Type
edge-case

## Priority
high — attackers may probe with garbage tokens; must not crash or leak info.

## Preconditions
- No valid session exists for the supplied token value.

## Action
```
GET /api/v1/dashboard/stats
Cookie: session=not-a-valid-uuid-and-definitely-not-in-d1
```

## Expected Outcome
HTTP 401 with body:
```json
{ "error": "Unauthorized." }
```
- No D1 data is returned.
- The response is identical to the "no cookie" case (EC-1: no information leakage about why auth failed).
- No 500 error, no stack trace, no crash.

## Failure Mode
If this returns 500 or a stack trace, `requireCtoSession` is not handling the "not found" case gracefully.

## Notes
The D1 query will return zero rows. `requireCtoSession` must treat "zero rows returned" as auth failure, not as an exception condition.
