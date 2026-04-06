# Scenario: H-23 — No session cookie returns 401 with no-store header

## Type
edge-case

## Priority
critical — unauthenticated access must be rejected before any data query

## Preconditions
- No session cookie in the request
- Events exist in the database

## Action
```
GET /api/v1/dashboard/events
(no Cookie header)
```

## Expected Outcome
- Status: 401
- Body: `{ "error": "Unauthorized" }`
- `Cache-Control: no-store` header present
- No D1 query is made (auth check is pre-query)
- No event data is present in the response

## Notes
Verifies NFR-3 (auth runs before D1 queries), FR-17 (no-store on errors). The `requireCtoSession` helper is called first; if it returns a 401 response, the handler exits immediately. This also applies to expired sessions.
