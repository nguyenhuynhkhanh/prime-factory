# Scenario H-15: All four required indexes are present in the generated migration SQL

## Type
edge-case

## Priority
high — missing indexes will cause D1 table scans on every dashboard query; on D1 free tier this can hit row-read limits

## Preconditions
- `db/schema.ts` has been updated with index declarations for `events` and `installs` tables
- `drizzle-kit generate` has been run, producing `db/migrations/0000_initial.sql`

## Action
Inspect `db/migrations/0000_initial.sql` (static analysis — no HTTP request).

## Expected Outcome
The migration SQL file contains all of the following `CREATE INDEX` statements:
- `CREATE INDEX events_org_id_idx ON events (org_id);`
- `CREATE INDEX events_org_id_created_at_idx ON events (org_id, created_at);`
- `CREATE INDEX events_install_id_idx ON events (install_id);`
- `CREATE INDEX installs_org_id_idx ON installs (org_id);`

## Notes
FR-11 in the spec. If any index is missing, dashboard queries (`WHERE org_id = ?` with ORDER BY `created_at`) will perform full table scans on D1, consuming the daily row-read budget rapidly.
