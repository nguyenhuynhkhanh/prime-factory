# Architecture & Performance Review — api-key-management-data

Status: APPROVED WITH NOTES

## Findings

### Blocker

None.

### Concerns

**C-1: No `DROP TABLE IF EXISTS installs_new` guard before CREATE TABLE**

Severity: Concern

The migration starts with `CREATE TABLE installs_new (...)`. If a previous partial run left `installs_new` behind (EC-3 scenario: failure between DROP and RENAME), re-running the migration will fail immediately at the CREATE TABLE statement rather than at the idempotency guard mentioned in NFR-1. This means an operator attempting to recover from EC-3 by re-running the migration cannot do so without first manually dropping `installs_new`.

Recommendation: Prepend `DROP TABLE IF EXISTS installs_new;` + `--> statement-breakpoint` as the very first statement in the migration. This does not conflict with NFR-1 (the idempotency guard for a fully-applied migration is the `CREATE TABLE installs` that fails after the RENAME — that path is unaffected).

---

**C-2: Deployment order creates a window of insert failures**

Severity: Concern

The zero-downtime deployment order in the spec is:
1. Deploy new application code
2. Run migration

The existing `POST /api/v1/installs/route.ts` inserts a row that includes `hmac` (a NOT NULL column in the current schema). When new application code is deployed (with `hmac` removed from `db/schema.ts`), Drizzle will no longer include `hmac` in the INSERT statement. The OLD table (pre-migration) requires `hmac NOT NULL`, so any `POST /api/installs` request between step 1 and step 2 will receive a D1 constraint error.

The correct zero-downtime order for this type of schema change is:
1. Take D1 backup
2. Run migration first (new table has `hmac` dropped)
3. Deploy new application code (which no longer sends `hmac`)

Recommendation: Invert deployment steps 2 and 3. Migrate first, deploy code second. The migration is additive enough (new nullable columns, dropped column) that existing code running against the new schema will fail only on `hmac` inserts, which is the same failure mode — so running migration first is strictly safer. Update the "Zero-downtime deployment order" section accordingly.

---

**C-3: `expiresAt` and `revokedAt` lack indexes for anticipated query patterns**

Severity: Concern

The server and auth middleware will query active installs using patterns like `WHERE api_key = ? AND (revoked_at IS NULL) AND (expires_at > ?)`. Currently only `installs_api_key_unique` (the lookup key) is indexed. At this project's scale (small number of installs per org), a full scan after the primary key lookup is negligible. However, if `requireApiKey.ts` is updated to check expiry and revocation status (the natural next step after this data layer change), those filter predicates run on every CLI request.

Recommendation: No action required at MVP scale. Flag for the `api-key-management-server` spec author: if the auth middleware adds `expires_at` / `revoked_at` filter predicates to the API key lookup query, the existing `installs_api_key_unique` index already makes the lookup O(1) by `api_key`; D1 will evaluate the additional column predicates on the single matched row (not a scan). No additional indexes are needed unless the admin UI introduces queries that filter installs by expiry/revocation status across an org without an `api_key` predicate.

---

### Notes

**N-1: `integer({ mode: "timestamp" })` semantics are consistent with existing schema**

The spec correctly follows the `sessions.expiresAt` pattern already established in `db/schema.ts`. Drizzle stores `Date` objects as Unix seconds integers and returns `Date` objects on read. The raw SQL migration arithmetic (`created_at + 2592000`) operates on the stored integer values directly — this is correct and safe.

**N-2: `_journal.json` version field**

The new entry uses `"version": "6"`, consistent with the existing `idx: 0` entry. The top-level `"version": "7"` is the journal format version (distinct from the migration entry version). This is correct.

**N-3: `computer_name` / `git_user_id` nullable transition is safe**

Existing rows have non-null values for both columns (enforced by the previous schema). The INSERT SELECT copies them verbatim. Making them nullable in the new schema does not affect existing data integrity and correctly models the new "pre-activation" state for admin-created installs.

**N-4: No drizzle-kit snapshot update required**

The spec correctly notes that the migration is hand-written and `drizzle-kit generate` is not used. However, the `db/migrations/meta/` directory will be out of sync with `db/schema.ts` after this change — `0000_snapshot.json` will no longer match the live schema. This is acceptable for a D1 deployment (migrations are applied directly via wrangler), but running `drizzle-kit generate` in the future will produce a diff-based migration. The implementation notes should remind the implementer not to run `drizzle-kit generate` after applying this hand-written migration without first updating the snapshot, or to treat the snapshot as stale from this point.

**N-5: `installs_new` table name collision**

Using `installs_new` as the staging table name is a reasonable convention. The name is not used anywhere else in the codebase. No concern.

## Summary

The spec is architecturally sound. The SQLite table-recreation pattern (create new, insert-select, drop old, rename) is the correct approach for D1 given its lack of transactional DDL and limited ALTER TABLE support. The Drizzle schema definition follows existing project conventions exactly. Two concerns warrant attention before implementation: (1) a missing `DROP TABLE IF EXISTS installs_new` guard that would prevent re-run after a partial failure, and (2) an inverted deployment order that creates a window of install-registration failures between code deploy and migration run — the migration should run before the new code is deployed. Neither concern is a blocker since they can be addressed in the implementation directly, but both should be corrected in the spec before the implementer begins.
