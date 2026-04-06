# Scenario: H-20 — installId belonging to correct org but with zero events returns empty results

## Type
edge-case

## Priority
medium — valid install with no events is distinct from a cross-org install

## Preconditions
- CTO authenticated; `orgId = "org-acme"`
- Install `install-new` exists in org-acme (correct org)
- 0 events have been ingested for `install-new`
- Other installs in org-acme have events (to confirm the empty result is install-specific)

## Action
```
GET /api/v1/dashboard/events?installId=install-new
Cookie: session=<valid-cto-session>
```

## Expected Outcome
- Status: 200
- `events` array is empty: `[]`
- `pagination`: `{ "page": 1, "limit": 50, "total": 0, "hasMore": false }`
- No 404 (the install exists, it just has no events)
- Events from other installs are NOT included

## Notes
Verifies EC-9. The distinction from H-01 (cross-org installId): here the install belongs to the correct org and the result is legitimately empty because no events have been ingested yet.
