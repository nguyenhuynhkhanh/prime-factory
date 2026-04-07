# Security & Data Integrity Review — api-key-management-data

Status: APPROVED WITH NOTES

## Findings

**[Concern] HMAC column deletion removes the only machine-binding security control without a stated replacement**

The spec drops `hmac` from the schema (FR-6) — correctly, since the new server-generated flow eliminates the CLI-supplied HMAC. However, `requireApiKey.ts` currently checks only that `API_KEY_SALT` is configured (≥ 16 chars) as a misconfiguration guard; the salt is never actually used for verification in the auth path. After this migration, machine-binding enforcement disappears entirely at the data layer: any leaked API key can be replayed from any host. This is a known, accepted trade-off for the new admin-managed key model, but the spec should explicitly state it as a security posture change and confirm that the server spec (`api-key-management-server`) adds expiry/revocation checks to `requireApiKey` to compensate. The data layer change is fine on its own, but the security note is missing from this spec.

Recommendation: Add a note under Business Rules or Migration acknowledging this posture change and referencing the server spec's obligation to enforce `expires_at` and `revoked_at` in `requireApiKey`.

**[Concern] `installs/route.ts` will break at compile time after `hmac` is removed from schema**

The existing `POST /api/v1/installs/route.ts` at line 222 inserts `hmac` as a field. After `db/schema.ts` is updated to remove `hmac`, TypeScript strict mode will flag this as a compile error. The spec's Implementation Notes do mention grepping for `installs.hmac` references (last bullet), but it frames this as a pre-flight check rather than an explicit requirement. Since this spec says "Out of Scope: server endpoints" and the server spec presumably owns the rewrite of `POST /api/installs`, there is a window where the data migration has landed but the server route has not been updated, causing a broken build.

Recommendation: The spec should explicitly note that `db/schema.ts` changes will cause a compile-time break in `app/api/v1/installs/route.ts` and that this spec's implementation must be deployed in the same release as the server spec changes that rewrite that route, or a shim must remove the `hmac` field insert in the interim.

**[Concern] `expires_at` backfill silently expires all installs older than 30 days with no audit record**

FR-9 and EC-2 note that legacy installs created more than 30 days before the migration will have a backfilled `expires_at` in the past, and describe this as "intentional." This is a silent, permanent revocation of active CLI installs with no notification mechanism and no audit timestamp. `revoked_at` remains NULL for these rows (FR-10), so they will look like unrevoked-but-expired installs, which is semantically ambiguous.

Recommendation: The spec is acceptable as written since the intent is explicitly documented, but it should be strengthened by noting that: (a) existing CLI users will receive auth failures immediately after migration with no advance warning, and (b) the server spec's updated `requireApiKey` must return a meaningful error (e.g., `{ error: "key expired" }` with 401 or 403) rather than a generic 401, so operators can distinguish expired from invalid keys. This is a UX concern but has a security dimension — unexplained 401s can cause developers to request new keys through insecure channels.

**[Note] No UNIQUE constraint on `label`; empty string default is acceptable**

FR-1 specifies `label DEFAULT ''` with label uniqueness deferred to the API layer. The spec explicitly documents this decision. For this data layer review, the empty-string default is correct — it avoids NOT NULL constraint violations during migration. No action required.

**[Note] `installs_api_key_unique` index recreated correctly after table recreation**

The migration DROP TABLE / RENAME pattern requires explicit index recreation (the unique index on `api_key` does not transfer with the rename). The SQL in the spec correctly includes `CREATE UNIQUE INDEX installs_api_key_unique` after the rename. This is the critical integrity constraint for the auth path and it is preserved. No action required.

**[Note] Migration idempotency (NFR-1) is correctly handled**

A second run will fail loudly at `CREATE TABLE installs_new` because `installs_new` already exists (from the previous successful migration that was then renamed to `installs`). Actually: after a successful run, `installs_new` no longer exists (it was renamed to `installs`), so a second full run would fail at `CREATE TABLE installs_new` only if the table still exists. On a clean successful run, the second run would actually reach `INSERT INTO installs_new SELECT ... FROM installs` — which would work because `installs` still exists (it was the renamed table). This means a second run would silently double-migrate an already-migrated table. However, this is the standard D1 migration risk documented in NFR-2, and the Drizzle journal prevents accidental re-runs via the migration tooling. No spec change needed, but operators should be aware.

**[Note] D1 backup requirement is correctly called out (NFR-2)**

The rollback plan and zero-downtime deployment order are clearly specified. The absence of transactional DDL means the DROP-then-RENAME window is a real data-loss risk, and the spec correctly mandates a backup before execution. No action required.

**[Note] `integer({ mode: "timestamp" })` for `expires_at` / `revoked_at` stores Unix seconds**

Drizzle's `mode: "timestamp"` stores and reads Unix seconds as a JS `Date`. This is consistent with `createdAt` and `lastSeenAt` in the existing schema. Code that later compares `expires_at` to `Date.now()` must use `Math.floor(Date.now() / 1000)` (seconds) not milliseconds. The spec documents this correctly in Implementation Notes. No action required.

## Summary

The data model changes are structurally sound. The migration SQL correctly handles the SQLite table-recreation pattern required by D1, preserves all existing row data, and recreates both indexes. The two Concerns do not block this data layer spec on their own, but they represent risk that must be resolved before the full feature ships: (1) the compile-time break in the installs registration route must be coordinated with the server spec deployment, and (2) the silent expiry of all pre-migration installs older than 30 days should be explicitly acknowledged in the spec with a note about the downstream error messaging requirement in the server spec. Neither concern requires a schema or migration change — they are documentation and coordination gaps.
