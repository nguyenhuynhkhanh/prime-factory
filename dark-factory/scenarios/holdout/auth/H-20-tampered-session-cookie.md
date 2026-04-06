# Scenario H-20: Tampered session cookie value returns 401, not 500

## Type
edge-case

## Priority
high — adversarial input must not cause an unhandled exception

## Preconditions
- CTO user exists with a valid session in D1

## Action
Multiple requests with malformed cookie values:

Case A — garbled UUID:
```
GET /api/v1/auth/me
Cookie: __Host-session=not-a-real-uuid-!!!
```

Case B — SQL injection attempt:
```
GET /api/v1/auth/me
Cookie: __Host-session='; DROP TABLE sessions; --
```

Case C — very long string (4096 chars):
```
GET /api/v1/auth/me
Cookie: __Host-session=<4096 random chars>
```

## Expected Outcome (all cases)
- HTTP 401
- Response body: `{ "error": "unauthorized" }`
- No 500 error
- No SQL error leaks in the response
- D1's parameterised query handling prevents injection; no table is dropped

## Notes
EC-10 in the spec. The D1 lookup uses parameterised queries (Drizzle ORM handles this). The session id is passed as a parameter, not interpolated into SQL. The result will simply be `null` / empty for non-existent ids, returning 401.
