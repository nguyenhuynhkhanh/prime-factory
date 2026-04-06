# Scenario H-04: Stats API never uses client-supplied orgId

## Type
edge-case

## Priority
critical — cross-tenant data leakage via crafted request.

## Preconditions
- CTO Alice has a valid session for org `org-alice`.
- Org `org-bob` exists with data that org-alice should never see.
- Alice's session resolves `orgId = "org-alice"` from D1.

## Action
```
GET /api/v1/dashboard/stats?orgId=org-bob
Cookie: session=<alice-valid-token>
```

Also test with a request body (even though it's a GET, some implementations incorrectly read a body):
```
GET /api/v1/dashboard/stats
Cookie: session=<alice-valid-token>
Content-Type: application/json
Body: { "orgId": "org-bob" }
```

## Expected Outcome
- Both requests return HTTP 200 with data scoped exclusively to `org-alice`.
- Zero rows from `org-bob` appear in any field of the response.
- The query parameter `?orgId=org-bob` is silently ignored.
- The request body `orgId` is silently ignored.

## Failure Mode
If any response contains data from `org-bob`, there is a cross-tenant data leakage vulnerability. This is a critical security failure.

## Notes
The route handler must source `orgId` exclusively from `requireCtoSession`'s return value. Any code path that reads `orgId` from `request.nextUrl.searchParams` or `request.json()` is a bug.
