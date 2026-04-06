# Scenario H-01: Cross-org isolation — CTO from org A cannot see org B installs

## Type
edge-case

## Priority
critical — cross-org data leakage is a hard security requirement

## Preconditions
- Org A: `orgId = "org-a"`, CTO user `cto-a@example.com` with valid session cookie
- Org B: `orgId = "org-b"`, CTO user `cto-b@example.com`
- Org A has 2 installs: `install-a1`, `install-a2`
- Org B has 1 install: `install-b1`

## Action
```
GET /api/v1/dashboard/installs
Headers:
  Cookie: session=<valid-session-for-cto-a>
```

## Expected Outcome
- HTTP 200
- The `installs` array contains exactly 2 elements: `install-a1` and `install-a2`
- `install-b1` is absent from the response
- The response does not leak any data from org-b at any depth

## Failure Mode
N/A — read-only.

## Notes
- FR-1 and BR-1 coverage.
- The `WHERE installs.org_id = :orgId` clause with the session-derived `orgId` is the only
  enforcement mechanism. Verify that the bound parameter is the session `orgId`, not any
  client-supplied value.
