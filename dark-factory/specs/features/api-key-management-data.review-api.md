# API Design & Backward Compatibility Review — api-key-management-data

Status: APPROVED WITH NOTES

## Findings

**Concern 1 — TypeScript type breakage in four consumer files**
Severity: Concern

`computerName`/`gitUserId` are typed as non-nullable `string` in:
- `app/api/v1/dashboard/installs/route.ts` (InstallRow, InstallRecord)
- `app/(dashboard)/installs/page.tsx` (InstallRecord)
- `app/(dashboard)/events/page.tsx` (EventRow)
- `app/api/v1/dashboard/events/route.ts` (Drizzle select inference)

After the schema change Drizzle infers `string | null` for these columns. Build will break under strict TypeScript. These type updates must land together with this spec's schema.ts change (or be explicitly deferred to api-key-management-server with a note that the build is broken between specs).

Recommendation: Code-agent must update the four consumer files to use `string | null` for computerName/gitUserId as part of this spec, OR the spec explicitly states these are deferred to api-key-management-server and the two specs must be deployed atomically.

**Concern 2 — Hard TypeScript compile error in `app/api/v1/installs/route.ts`**
Severity: Concern

`app/api/v1/installs/route.ts` line ~222 passes `hmac` in `db.insert(installs).values({...})`. After schema drops `hmac`, this is a TypeScript error. The route is being superseded by api-key-management-server but until that spec lands, this file exists in the codebase with a compile error.

Recommendation: Code-agent should remove the `hmac` field from the `.values()` call and remove the HMAC-related logic from this file (stub it out or gut the handler) as part of this data spec, so the build doesn't break.

**Concern 3 — Deployment order ambiguity**
Severity: Note

The spec says "deploy new code then migrate." This is only safe if "new code" means api-key-management-server changes (which removes hmac from the insert). Schema-only changes from this spec deployed alone will cause D1 NOT NULL constraint failures. The two specs must be deployed atomically.

## Summary

The spec is sound at the data layer. The migration SQL, backfill logic, and index recreation are correct. The primary risk is that updating db/schema.ts immediately breaks four consumer files' TypeScript type contracts and one route handler's insert call. These are not runtime failures for existing data but will break `tsc --strict`. Either the code-agent resolves the type breaks in this spec, or the spec explicitly documents that the two specs (data + server) must be deployed in the same release with no build checks between them.
