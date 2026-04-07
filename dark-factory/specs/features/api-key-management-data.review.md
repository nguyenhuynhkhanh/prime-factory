# Architect Review — api-key-management-data

**Status: APPROVED WITH NOTES**

Reviewed by 3 domain architects. No blockers found.

## Key Decisions Made

1. **Add `DROP TABLE IF EXISTS installs_new` as first migration statement** (Architecture C-1)
   The spec's migration SQL must prepend `DROP TABLE IF EXISTS \`installs_new\`;` followed by `--> statement-breakpoint` as the very first statement. A prior partial-failure leaves `installs_new` stranded and the migration cannot be re-run without this guard.

2. **Deployment order: migrate first, then deploy code** (Architecture C-2, API Concern 3)
   The spec's stated order (deploy code → migrate) is wrong. The old `installs` table has `hmac NOT NULL` and `computer_name NOT NULL`. Deploying new schema.ts changes before running the migration causes Drizzle ORM type inference to diverge from the live table. Correct order: backup → migrate → deploy code. The two specs (data + server) should be deployed in the same release.

3. **Remove `hmac` from `app/api/v1/installs/route.ts`** (Security Concern 2, API Concern 2)
   Updating `db/schema.ts` to drop `hmac` causes a TypeScript compile error in `app/api/v1/installs/route.ts` (which still passes `hmac` in `.values()`). The code-agent must gut or stub the old install registration handler as part of this spec so the build doesn't break.

4. **Update consumer files' TypeScript interfaces** (API Concern 1)
   `computerName`/`gitUserId` are typed as non-nullable `string` in four files. After this schema change Drizzle infers `string | null`. The code-agent must update those interfaces to `string | null` so `tsc --strict` passes:
   - `app/api/v1/dashboard/installs/route.ts` — InstallRow, InstallRecord
   - `app/(dashboard)/installs/page.tsx` — InstallRecord
   - `app/(dashboard)/events/page.tsx` — EventRow
   - `app/api/v1/dashboard/events/route.ts` — response shape

## Remaining Notes

- **HMAC removal security posture**: The spec correctly drops HMAC but should be implemented alongside the server spec's `requireApiKey` updates (revoked_at/expires_at enforcement) to close the security window. Acceptable as a sequenced deploy.
- **No indexes on expires_at/revoked_at**: Not needed — auth lookups go through `api_key` unique index (O(1)). The server spec author should note this.
- **`installs_api_key_unique` unique index**: Correctly recreated via `CREATE UNIQUE INDEX` after RENAME — consistent with SQLite best practice.
- **`integer({ mode: "timestamp" })` usage**: Consistent with existing `sessions` table schema. Correct.
- **`_journal.json` version fields**: Top-level `"version": "7"` is the journal format version; entry `"version": "6"` is the Drizzle ORM schema version. Both are correct.
