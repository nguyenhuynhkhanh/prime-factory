# Feature: API Key Management — Data Layer (api-key-management-data)

## Context

The current `installs` table was designed for a CLI-driven self-registration flow where
the CLI supplied its own `userId` as the install `id` and a server-verified HMAC proved
machine identity. The upcoming Admin API Key Management feature inverts this: the server
generates keys and assigns them to installs that admins create. This requires schema
changes that cannot be done with a simple `ALTER TABLE` in SQLite/D1.

This spec covers ONLY the data layer changes: updating `db/schema.ts` and producing the
migration SQL + journal entry. It is the foundation that the server, UI, and CLI sub-specs
build on.

## Scope

### In Scope
- Update `db/schema.ts` installs table definition to match the new shape
- Write `db/migrations/0001_api_key_management.sql` with the full table-recreation migration
- Update `db/migrations/meta/_journal.json` with the new entry

### Out of Scope
- Server endpoints that use the new columns (`api-key-management-server` spec)
- Admin UI for creating/revoking keys (`api-key-management-ui` spec)
- CLI changes to consume the new activation flow (`api-key-management-cli` spec)
- Label uniqueness enforcement at DB level (handled at API layer — no UNIQUE constraint on label)

## Requirements

### Functional
- FR-1: The `installs` table must have a `label` column (`text NOT NULL DEFAULT ''`)
- FR-2: The `installs` table must have an `expires_at` column (`integer NOT NULL`) storing Unix seconds
- FR-3: The `installs` table must have a `revoked_at` column (`integer`, nullable) storing Unix seconds or NULL
- FR-4: `computer_name` must become nullable (NULL until `/activate` is called by the CLI)
- FR-5: `git_user_id` must become nullable (NULL until `/activate` is called by the CLI)
- FR-6: The `hmac` column must be dropped entirely
- FR-7: Existing rows must be migrated without data loss to `id`, `org_id`, `api_key`, `created_at`, `last_seen_at` values
- FR-8: Existing rows must receive a backfilled `label` of `'legacy-' || substr(id, 1, 8)`
- FR-9: Existing rows must receive a backfilled `expires_at` of `created_at + 2592000` (30 days in seconds). Some may already be in the past — this is acceptable; the new server flow will require re-onboarding for those installs.
- FR-10: Existing rows must receive `revoked_at = NULL`
- FR-11: The `installs_org_id_idx` index must be recreated on the new table
- FR-12: The `installs_api_key_unique` unique index must be preserved
- FR-13: Existing `events` rows must not be affected; `events.install_id` referential integrity is preserved because existing `installs.id` values are kept unchanged

### Non-Functional
- NFR-1: The migration must fail loudly on a second run (CREATE TABLE will fail if table already exists), not silently corrupt data
- NFR-2: D1 does not support transactional DDL. A D1 database backup must be taken before running this migration in production
- NFR-3: The Drizzle schema in `db/schema.ts` must be TypeScript-strict-mode compatible

## Data Model

### New `installs` table shape

| Column        | Type    | Constraints          | Notes                                        |
|---------------|---------|----------------------|----------------------------------------------|
| id            | text    | PRIMARY KEY NOT NULL | Preserved from existing rows; server-generated UUID for new rows |
| org_id        | text    | NOT NULL             | Unchanged                                    |
| label         | text    | NOT NULL DEFAULT ''  | Admin-assigned name, max 64 chars (API layer) |
| computer_name | text    | nullable             | NULL until CLI calls /activate               |
| git_user_id   | text    | nullable             | NULL until CLI calls /activate               |
| api_key       | text    | NOT NULL UNIQUE      | Unchanged                                    |
| expires_at    | integer | NOT NULL             | Unix seconds; new rows: now + 2592000 (30d)  |
| revoked_at    | integer | nullable             | NULL = active; non-null = revoked timestamp  |
| created_at    | integer | NOT NULL             | Unchanged                                    |
| last_seen_at  | integer | nullable             | Unchanged                                    |

### Drizzle ORM representation (`db/schema.ts`)

Replace the current `installs` table definition with:

```ts
export const installs = sqliteTable(
  "installs",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    label: text("label").notNull().default(""),
    computerName: text("computer_name"),
    gitUserId: text("git_user_id"),
    apiKey: text("api_key").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    revokedAt: integer("revoked_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    lastSeenAt: integer("last_seen_at", { mode: "timestamp" }),
  },
  (t) => [
    index("installs_org_id_idx").on(t.orgId),
  ]
);
```

No other tables in `db/schema.ts` are modified.

## Migration

### File: `db/migrations/0001_api_key_management.sql`

```sql
CREATE TABLE `installs_new` (
    `id` text PRIMARY KEY NOT NULL,
    `org_id` text NOT NULL,
    `label` text NOT NULL DEFAULT '',
    `computer_name` text,
    `git_user_id` text,
    `api_key` text NOT NULL,
    `expires_at` integer NOT NULL,
    `revoked_at` integer,
    `created_at` integer NOT NULL,
    `last_seen_at` integer
);
--> statement-breakpoint
INSERT INTO `installs_new`
    SELECT
        id,
        org_id,
        'legacy-' || substr(id, 1, 8) AS label,
        computer_name,
        git_user_id,
        api_key,
        (created_at + 2592000) AS expires_at,
        NULL AS revoked_at,
        created_at,
        last_seen_at
    FROM `installs`;
--> statement-breakpoint
DROP TABLE `installs`;
--> statement-breakpoint
ALTER TABLE `installs_new` RENAME TO `installs`;
--> statement-breakpoint
CREATE UNIQUE INDEX `installs_api_key_unique` ON `installs` (`api_key`);
--> statement-breakpoint
CREATE INDEX `installs_org_id_idx` ON `installs` (`org_id`);
```

### Journal update: `db/migrations/meta/_journal.json`

Add entry with `idx: 1` at the end of the `entries` array:
```json
{
  "idx": 1,
  "version": "6",
  "when": <Date.now() at implementation time>,
  "tag": "0001_api_key_management",
  "breakpoints": true
}
```

### Existing data handling
- `id`, `org_id`, `api_key`, `created_at`, `last_seen_at`: preserved verbatim
- `label`: backfilled as `'legacy-' || substr(id, 1, 8)` (first 8 chars of UUID = 15 chars total)
- `expires_at`: backfilled as `created_at + 2592000`. Installs older than 30 days will appear expired — intentional.
- `revoked_at`: NULL for all existing rows
- `computer_name`, `git_user_id`: copied as-is (currently NOT NULL, so all existing rows have values)
- `hmac`: discarded

### Rollback plan
D1 does not support transactional DDL. Before running in production:
1. Take a manual D1 backup via `wrangler d1 export`
2. If migration fails after DROP but before RENAME: restore from backup, or manually rename `installs_new` to `installs` and re-run the index statements

### Zero-downtime deployment order
1. Take D1 backup
2. Deploy new application code (which does not write `hmac`)
3. Run migration

## Business Rules
- BR-1: `expires_at` for new inserts is `Math.floor(Date.now() / 1000) + 2592000` — set at server insert time, not by the migration
- BR-2: `revoked_at = NULL` means active. Any non-null value means revoked.
- BR-3: `label` default is empty string (NOT NULL DEFAULT ''). Labels are never NULL.
- BR-4: `id` for new rows must be server-generated (`crypto.randomUUID()`) — behavioral change in server spec
- BR-5: Existing `events.install_id` references remain valid because existing `installs.id` values are preserved

## Acceptance Criteria

- [ ] AC-1: `db/schema.ts` exports the updated `installs` table with `label`, `expiresAt`, `revokedAt`; `computerName` and `gitUserId` are nullable; `hmac` is absent
- [ ] AC-2: `db/migrations/0001_api_key_management.sql` exists with CREATE TABLE, INSERT SELECT, DROP TABLE, RENAME, and index statements with `--> statement-breakpoint` separators
- [ ] AC-3: After migration, all original `id`, `org_id`, `api_key`, `created_at`, `last_seen_at` values are preserved exactly
- [ ] AC-4: After migration, existing rows have `label = 'legacy-' || substr(id, 1, 8)`
- [ ] AC-5: After migration, existing rows have `expires_at = created_at + 2592000`
- [ ] AC-6: After migration, existing rows have `revoked_at = NULL`
- [ ] AC-7: The `hmac` column does not exist in the migrated table
- [ ] AC-8: The `installs_api_key_unique` unique index exists on the migrated table
- [ ] AC-9: The `installs_org_id_idx` index exists on the migrated table
- [ ] AC-10: `db/migrations/meta/_journal.json` has exactly 2 entries; entry `idx: 1` has `tag: "0001_api_key_management"`
- [ ] AC-11: Applying the migration to an empty `installs` table succeeds without error
- [ ] AC-12: After migration, rows in the `events` table are unchanged and their `install_id` values still match `installs.id` values

## Edge Cases
- EC-1: `installs` table is empty at migration time — INSERT SELECT copies zero rows; proceeds normally
- EC-2: An existing install was created more than 30 days before migration — its backfilled `expires_at` will be in the past. Intentional.
- EC-3: Migration fails between DROP and RENAME — `installs_new` exists with all data; restore from backup or rename manually
- EC-4: `computer_name` or `git_user_id` is an empty string (not NULL) in existing rows — copied verbatim; empty string and NULL are semantically distinct

## Dependencies

None — this spec is independently implementable.

Depended on by: `api-key-management-server`, `api-key-management-ui`, `api-key-management-cli`

Group: `api-key-management`

## Implementation Size Estimate

- **Scope size**: small (3 files)
- **Suggested parallel tracks**: 1 track only — schema must match migration SQL exactly; parallelism risks drift

## Implementation Notes

- `integer(name, { mode: "timestamp" })` stores Unix seconds and returns a JS `Date`. Follow the same pattern used by `createdAt` and `lastSeenAt` in the `sessions` table.
- `text("label").notNull().default("")` — Drizzle `.default()` maps to SQL `DEFAULT ''`
- Drizzle-kit `generate` is NOT used here — the migration file is written by hand because D1's lack of transactional DDL means the generated migration would be incorrect
- The `when` timestamp in `_journal.json` is milliseconds (`Date.now()`), not Unix seconds
- Before removing `hmac` from schema.ts, grep for any other references to `installs.hmac` in the codebase
