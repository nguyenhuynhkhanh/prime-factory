# Scenario: H-01 — Cross-org installId returns empty results, not 403

## Type
edge-case

## Priority
critical — install IDs are not secret; org_id is the security boundary

## Preconditions
- Org "acme" (`orgId=org-acme`) with CTO authenticated via valid session
- Org "rival" (`orgId=org-rival`) with its own install `install-rival-1`
- 3 events exist for `install-rival-1` belonging to org-rival
- 0 events exist for org-acme

## Action
```
GET /api/v1/dashboard/events?installId=install-rival-1
Cookie: session=<valid-acme-cto-session>
```

## Expected Outcome
- Status: 200
- `events` array is empty: `[]`
- `pagination`: `{ "page": 1, "limit": 50, "total": 0, "hasMore": false }`
- No 403 is returned
- The rival org's events are NOT visible
- The CTO cannot infer whether `install-rival-1` exists from the response

## Notes
Verifies FR-7, BR-1, BR-6. The `org_id` WHERE clause applied first means the cross-org install ID simply finds no matching rows — it is indistinguishable from a valid same-org install with no events.
