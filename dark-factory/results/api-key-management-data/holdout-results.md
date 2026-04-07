# Holdout Test Results — api-key-management-data

## H-01: Migration succeeds when installs table is empty
Status: PASS
Evidence: The migration uses `DROP TABLE IF EXISTS installs_new` (safe start), then `CREATE TABLE installs_new` with exactly the required columns (id, org_id, label, computer_name, git_user_id, api_key, expires_at, revoked_at, created_at, last_seen_at) — no `hmac` column present. The `INSERT INTO installs_new SELECT ... FROM installs` with zero rows is a no-op and produces no error. `DROP TABLE installs` and `ALTER TABLE installs_new RENAME TO installs` both succeed on an empty table. Both indexes (`installs_api_key_unique` unique index and `installs_org_id_idx` regular index) are created correctly. A post-migration INSERT omitting `label` (which has `DEFAULT ''`) would succeed.

## H-02: Migration preserves events.install_id references
Status: PASS
Evidence: The migration copies all rows from `installs` to `installs_new` preserving `id` values verbatim, then drops the original and renames the new table — `id` values are unchanged. The `events` table is never touched by the migration, so event rows (and their `install_id` references) are completely unmodified. The label backfill `'legacy-' || substr(id, 1, 8)` for `id='install-ref-test-0000000000000001'` produces `'legacy-install-'` (8 chars: `install-`), which matches the expected outcome in the scenario. The JOIN query `events e JOIN installs i ON e.install_id = i.id` continues to resolve correctly after migration.

## Summary
Total: 2 passed, 0 failed
