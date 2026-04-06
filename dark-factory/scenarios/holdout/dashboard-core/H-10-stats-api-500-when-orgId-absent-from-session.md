# Scenario H-10: Stats API returns 500 when session resolves but orgId is absent

## Type
edge-case

## Priority
high — EC-2 / FR-14. Corrupt session state must be surfaced, not silently proceed with undefined orgId.

## Preconditions
- A session row exists in D1 with a valid, unexpired token.
- The `users` row referenced by `sessions.user_id` has been deleted (or `org_id` is NULL/empty in the users row — data integrity gap).
- `requireCtoSession` successfully finds the session row but cannot resolve a valid `orgId` from the user record.

## Action
```
GET /api/v1/dashboard/stats
Cookie: session=<token-with-orphaned-user>
```

## Expected Outcome
HTTP 500 with body:
```json
{ "error": "Session data corrupt." }
```
- No D1 queries beyond the session lookup are executed.
- No stats data is returned.
- The error message does not expose the underlying cause (e.g., "user not found" or a SQL error).

## Failure Mode
- If the route proceeds to execute the aggregate queries with an undefined/null `orgId`, the D1 queries would run with `WHERE org_id = NULL`, potentially returning zero results and masking the bug with a silently empty response.
- If the route returns 401 instead of 500: the caller (page.tsx) would redirect to /login rather than surface a data integrity issue — hiding the problem.

## Notes
`requireCtoSession` must explicitly check that the resolved user record has a non-null, non-empty `orgId` before returning success. If not, it should return a distinct error that the route handler converts to a 500 response.
