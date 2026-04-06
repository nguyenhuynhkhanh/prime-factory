# Scenario: H-28 — Ingested events are visible to the dashboard-events consumer

## Type
edge-case

## Priority
high — cross-feature lifecycle: verifies that data written by this route is correctly
       readable by the dashboard-events query (shared resource: events table)

## Preconditions
- D1 contains:
  - `orgs` row: `id = "org-dash"`, `name = "Dash Org"`
  - `installs` row: `apiKey = "test-key-h28"`, `id = "install-h28"`, `orgId = "org-dash"`
  - `users` row: CTO user with `orgId = "org-dash"`, valid session cookie `sess-h28`
  - `events` table has 0 rows for `org-dash`

## Action

Step 1 — ingest an event via the CLI route:
```
POST /api/v1/events
Authorization: Bearer test-key-h28
Content-Type: application/json

{
  "command": "df-orchestrate",
  "startedAt": "2026-04-06T10:00:00.000Z",
  "outcome": "success",
  "featureName": "test-feature"
}
```

Step 2 — query the dashboard events endpoint (once implemented):
```
GET /api/v1/dashboard/events?orgId=org-dash
Cookie: session=sess-h28
```

## Expected Outcome
- Step 1: HTTP 201, row with `org_id = "org-dash"` is inserted
- Step 2: Response includes the event just ingested, with correct `command`,
  `outcome`, `featureName`, `installId`, and `orgId` values
- The `orgId` on the returned event row = `"org-dash"` (from key, not body)

## Notes
This is a forward-looking cross-feature scenario. If `dashboard-events` spec is not yet
implemented, Step 2 can be replaced by a direct D1 query:
  `SELECT * FROM events WHERE org_id = 'org-dash'`
The expected outcome for the D1 query is: exactly 1 row, with the values above.

This scenario exists to verify that `orgId` denormalization (Lead B's finding) works
end-to-end: the value stored by the ingest route is the one the dashboard will filter on.
