# Scenario P-06: GET /api/v1/auth/me returns current user identity

## Type
feature

## Priority
high — used by the dashboard to hydrate user context on every page load

## Preconditions
- CTO user exists: `{ id: "USER_UUID", email: "alice@example.com", role: "cto", orgId: "ORG_UUID" }`
- Valid session row exists in `sessions` with `expires_at` in the future
- `__Host-session` cookie is set to the session id

## Action
```
GET /api/v1/auth/me
Cookie: __Host-session=SESSION_ID
```

## Expected Outcome
- HTTP 200
- Response body: `{ "id": "USER_UUID", "email": "alice@example.com", "role": "cto", "orgId": "ORG_UUID" }`
- Response does NOT include `passwordHash` or any other sensitive field

## Failure Mode
N/A

## Notes
The response shape `{ id, email, role, orgId }` is the contract consumed by all dashboard features.
